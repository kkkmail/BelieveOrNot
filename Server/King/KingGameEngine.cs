// Server/King/KingGameEngine.cs
namespace BelieveOrNot.Server.King;

public class KingGameEngine : IKingGameEngine
{
    private readonly Random _random = new();

    public KingGameStateDto StartNewRound(KingMatch match)
    {
        if (match.Players.Count != 4)
        {
            throw new InvalidOperationException("King requires exactly 4 players");
        }

        var currentRound = match.CurrentRound;
        if (currentRound == null)
        {
            throw new InvalidOperationException("No more rounds to play");
        }

        // Deal new cards
        var deck = KingDeckBuilder.BuildDeck();
        KingDeckBuilder.Shuffle(deck, _random);
        KingDeckBuilder.DealCards(deck, match.Players);

        // Reset round state
        match.CurrentRoundTricks.Clear();
        match.CurrentTrick.Clear();
        match.CurrentTrickPlayerOrder.Clear();
        match.Phase = KingGamePhase.InProgress;

        // Set leader for this round (rotates each round)
        match.LeaderPlayerIndex = (match.CurrentRoundIndex) % 4;
        match.CurrentPlayerIndex = match.LeaderPlayerIndex;

        // Handle trump selection for collecting phase
        if (currentRound.RequiresTrumpSelection)
        {
            match.TrumpSetterIndex = (match.CurrentRoundIndex - match.GameRounds.Count(r => !r.IsCollectingPhase)) % 4;
            match.CurrentTrump = null;
            match.AvailableTrumpSuits = new List<KingSuit> { KingSuit.Hearts, KingSuit.Diamonds, KingSuit.Clubs, KingSuit.Spades };
        }
        else
        {
            match.CurrentTrump = null;
            match.AvailableTrumpSuits.Clear();
        }

        var state = CreateGameStateDto(match, Guid.Empty);
        state.Event = new KingEventDto
        {
            Type = "RoundStart",
            DisplayMessage = $"Round {match.CurrentRoundIndex + 1}: {currentRound.Name} started!"
        };

        return state;
    }

    public KingGameStateDto PlayCard(KingMatch match, Guid playerId, KingCard card)
    {
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            throw new InvalidOperationException("Player not found");
        }

        if (!IsValidPlay(match, player, card))
        {
            throw new InvalidOperationException("Invalid card play");
        }

        // Remove card from player's hand
        player.Hand.Remove(card);

        // Add card to current trick
        match.CurrentTrick.Add(card);
        match.CurrentTrickPlayerOrder.Add(GetPlayerIndex(match, playerId));

        string eventMessage = $"{player.Name} played {card}";

        // Check if trick is complete (4 cards)
        if (match.CurrentTrick.Count == 4)
        {
            var trick = CompleteTrick(match);
            eventMessage += $". {trick.Winner.Name} wins the trick.";

            // Check for round end conditions
            if (ShouldEndRound(match))
            {
                EndRound(match);
            }
            else
            {
                // Set next leader to trick winner
                match.CurrentPlayerIndex = GetPlayerIndex(match, trick.Winner.Id);
                match.LeaderPlayerIndex = match.CurrentPlayerIndex;
            }
        }
        else
        {
            // Move to next player
            match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % 4;
        }

        var state = CreateGameStateDto(match, playerId);
        state.Event = new KingEventDto
        {
            Type = "CardPlay",
            DisplayMessage = eventMessage,
            Data = new { PlayerName = player.Name, Card = card }
        };

        return state;
    }

    public KingGameStateDto SelectTrump(KingMatch match, Guid playerId, KingSuit trump)
    {
        var playerIndex = GetPlayerIndex(match, playerId);
        if (playerIndex != match.TrumpSetterIndex)
        {
            throw new InvalidOperationException("You are not the trump setter for this round");
        }

        var currentRound = match.CurrentRound;
        if (currentRound == null || !currentRound.RequiresTrumpSelection)
        {
            throw new InvalidOperationException("This round does not require trump selection");
        }

        match.CurrentTrump = trump;
        match.AvailableTrumpSuits.Clear();

        var player = match.Players[playerIndex];
        var state = CreateGameStateDto(match, playerId);
        state.Event = new KingEventDto
        {
            Type = "TrumpSelected",
            DisplayMessage = $"{player.Name} selected {trump} as trump",
            Data = new { PlayerName = player.Name, Trump = trump }
        };

        return state;
    }

    public KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId)
    {
        return CreateGameStateDto(match, playerId);
    }

    public bool IsValidPlay(KingMatch match, KingPlayer player, KingCard card)
    {
        if (!player.Hand.Contains(card))
        {
            return false;
        }

        if (match.CurrentTrick.Count == 0)
        {
            return true; // First card of trick, any card is valid
        }

        var leadSuit = match.CurrentTrick[0].Suit;
        var hasLeadSuit = player.Hand.Any(c => c.Suit == leadSuit);

        if (hasLeadSuit && card.Suit != leadSuit)
        {
            return false; // Must follow suit if possible
        }

        return true;
    }

    private KingTrick CompleteTrick(KingMatch match)
    {
        var trick = new KingTrick
        {
            Cards = new List<KingCard>(match.CurrentTrick),
            PlayOrder = match.CurrentTrickPlayerOrder.Select(i => match.Players[i]).ToList(),
            Trump = match.CurrentTrump,
            LeadSuit = match.CurrentTrick[0].Suit,
            TrickNumber = match.CurrentRoundTricks.Count + 1
        };

        // Determine winner
        trick.Winner = DetermineWinner(trick);

        // Add to completed tricks
        match.CurrentRoundTricks.Add(trick);

        // Clear current trick
        match.CurrentTrick.Clear();
        match.CurrentTrickPlayerOrder.Clear();

        return trick;
    }

    private KingPlayer DetermineWinner(KingTrick trick)
    {
        var winningCard = trick.Cards[0];
        var winningPlayerIndex = 0;

        for (int i = 1; i < trick.Cards.Count; i++)
        {
            var card = trick.Cards[i];

            // Trump beats non-trump
            if (trick.Trump.HasValue)
            {
                if (card.Suit == trick.Trump.Value && winningCard.Suit != trick.Trump.Value)
                {
                    winningCard = card;
                    winningPlayerIndex = i;
                }
                else if (card.Suit == trick.Trump.Value && winningCard.Suit == trick.Trump.Value)
                {
                    // Both trump, higher rank wins
                    if (card.Rank > winningCard.Rank)
                    {
                        winningCard = card;
                        winningPlayerIndex = i;
                    }
                }
                else if (winningCard.Suit != trick.Trump.Value && card.Suit == trick.LeadSuit && winningCard.Suit == trick.LeadSuit)
                {
                    // Both following lead suit, higher rank wins
                    if (card.Rank > winningCard.Rank)
                    {
                        winningCard = card;
                        winningPlayerIndex = i;
                    }
                }
            }
            else
            {
                // No trump, must follow lead suit
                if (card.Suit == trick.LeadSuit && winningCard.Suit == trick.LeadSuit)
                {
                    if (card.Rank > winningCard.Rank)
                    {
                        winningCard = card;
                        winningPlayerIndex = i;
                    }
                }
            }
        }

        return trick.PlayOrder[winningPlayerIndex];
    }

    private bool ShouldEndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound;
        if (currentRound == null) return true;

        // All 8 tricks played
        if (match.CurrentRoundTricks.Count >= 8)
        {
            return true;
        }

        // Check early end condition
        if (currentRound.CanEndEarly)
        {
            var earlyEndCondition = currentRound.GetEarlyEndCondition();
            if (earlyEndCondition != null)
            {
                return earlyEndCondition(match.CurrentRoundTricks);
            }
        }

        return false;
    }

    private void EndRound(KingMatch match)
    {
        match.Phase = KingGamePhase.RoundEnd;

        var currentRound = match.CurrentRound;
        if (currentRound != null)
        {
            var scoreCalculator = currentRound.GetScoreCalculator();
            if (scoreCalculator != null)
            {
                // Calculate scores for this round
                foreach (var player in match.Players)
                {
                    var roundScore = scoreCalculator(player, match.CurrentRoundTricks);
                    player.Score += roundScore;
                }
            }
        }

        // Move to next round or end game
        match.CurrentRoundIndex++;
        if (match.CurrentRoundIndex >= match.GameRounds.Count)
        {
            match.Phase = KingGamePhase.GameEnd;
        }
    }

    private KingGameStateDto CreateGameStateDto(KingMatch match, Guid requestingPlayerId)
    {
        var currentRound = match.CurrentRound;
        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);

        var state = new KingGameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new KingPlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected,
                Position = p.Position
            }).ToList(),
            CurrentRoundIndex = match.CurrentRoundIndex,
            CurrentRoundName = currentRound?.Name ?? "Game Over",
            CurrentRoundDescription = currentRound?.Description ?? "",
            IsCollectingPhase = currentRound?.IsCollectingPhase ?? false,
            CurrentPlayerIndex = match.CurrentPlayerIndex,
            LeaderPlayerIndex = match.LeaderPlayerIndex,
            CurrentTrump = match.CurrentTrump,
            TrumpSetterIndex = match.TrumpSetterIndex,
            CurrentTrick = new List<KingCard>(match.CurrentTrick),
            CurrentTrickPlayerOrder = new List<int>(match.CurrentTrickPlayerOrder),
            CreatorPlayerId = match.CreatorPlayerId,
            TotalRounds = match.GameRounds.Count,
            CanSelectTrump = currentRound?.RequiresTrumpSelection == true && match.TrumpSetterIndex == GetPlayerIndex(match, requestingPlayerId) && match.CurrentTrump == null,
            WaitingForTrumpSelection = currentRound?.RequiresTrumpSelection == true && match.CurrentTrump == null,
            MustDiscardKingOfHearts = match.MustDiscardKingOfHearts,
            AvailableTrumpSuits = new List<KingSuit>(match.AvailableTrumpSuits),
            EarlyEndCondition = currentRound?.EarlyEndConditionType ?? KingEarlyEndCondition.None,
            ScoreCalculator = currentRound?.ScoreCalculatorType ?? KingScoreCalculator.TricksCount,
            YourHand = requestingPlayer?.Hand ?? new List<KingCard>()
        };

        return state;
    }

    private int GetPlayerIndex(KingMatch match, Guid playerId)
    {
        for (int i = 0; i < match.Players.Count; i++)
        {
            if (match.Players[i].Id == playerId)
            {
                return i;
            }
        }
        return -1;
    }
}
