// Server/King/KingGameEngine.cs
namespace BelieveOrNot.Server.King;

public class KingGameEngine : IKingGameEngine
{
    private readonly Random _random = new();
    private readonly IKingMatchManager _matchManager;

    public KingGameEngine(IKingMatchManager matchManager)
    {
        _matchManager = matchManager;
    }

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
            // Trump will be set when the trump setter makes their selection
            match.CurrentTrump = null;
        }
        else
        {
            match.CurrentTrump = null;
        }

        var state = CreateGameStateDto(match, Guid.Empty);
        state.Event = new KingEventDto
        {
            Type = "RoundStart",
            DisplayMessage = $"Round {match.CurrentRoundIndex + 1}: {currentRound.Name} started!",
            Data = new { RoundIndex = match.CurrentRoundIndex, RoundName = currentRound.Name }
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

        if (match.Phase != KingGamePhase.InProgress)
        {
            throw new InvalidOperationException("Game is not in progress");
        }

        if (match.CurrentPlayerIndex != GetPlayerIndex(match, playerId))
        {
            throw new InvalidOperationException("Not your turn");
        }

        if (!IsValidPlay(match, player, card))
        {
            throw new InvalidOperationException("Invalid card play");
        }

        // Remove card from player's hand
        player.Hand.Remove(card);

        // Add to current trick
        match.CurrentTrick.Add(card);
        match.CurrentTrickPlayerOrder.Add(match.CurrentPlayerIndex);

        var eventMessage = $"{player.Name} played {card}";

        // Check if trick is complete
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

        // If this is the first card of the trick, any card is valid except Hearts in Hearts round
        if (match.CurrentTrick.Count == 0)
        {
            var currentRound = match.CurrentRound;
            if (currentRound?.Type == KingRoundType.DontTakeHearts)
            {
                // Cannot lead with Hearts unless no other suit available
                if (card.Suit == KingSuit.Hearts)
                {
                    return !player.Hand.Any(c => c.Suit != KingSuit.Hearts);
                }
            }
            return true;
        }

        // Must follow suit if possible
        var leadSuit = match.CurrentTrick[0].Suit;
        if (card.Suit == leadSuit)
        {
            return true;
        }

        // If cannot follow suit, check for special King of Hearts rule
        if (!player.Hand.Any(c => c.Suit == leadSuit))
        {
            var currentRound = match.CurrentRound;
            if (currentRound?.Type == KingRoundType.DontTakeKingOfHearts && !currentRound.IsCollectingPhase)
            {
                // Must discard King of Hearts if have it and cannot follow suit
                if (player.Hand.Any(c => c.IsKingOfHearts) && !card.IsKingOfHearts)
                {
                    return false;
                }
            }
            return true;
        }

        return false;
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

        match.CurrentRoundTricks.Add(trick);
        match.CurrentTrick.Clear();
        match.CurrentTrickPlayerOrder.Clear();

        return trick;
    }

    private KingPlayer DetermineWinner(KingTrick trick)
    {
        var winningCardIndex = 0;
        var winningCard = trick.Cards[0];

        for (int i = 1; i < trick.Cards.Count; i++)
        {
            var card = trick.Cards[i];
            
            // Trump beats non-trump
            if (trick.Trump.HasValue)
            {
                var isCurrentTrump = card.Suit == trick.Trump.Value;
                var isWinningTrump = winningCard.Suit == trick.Trump.Value;

                if (isCurrentTrump && !isWinningTrump)
                {
                    winningCard = card;
                    winningCardIndex = i;
                }
                else if (isCurrentTrump && isWinningTrump && card.Rank > winningCard.Rank)
                {
                    winningCard = card;
                    winningCardIndex = i;
                }
                else if (!isCurrentTrump && !isWinningTrump && card.Suit == trick.LeadSuit && card.Rank > winningCard.Rank)
                {
                    winningCard = card;
                    winningCardIndex = i;
                }
            }
            else
            {
                // No trump - highest card of lead suit wins
                if (card.Suit == trick.LeadSuit && card.Rank > winningCard.Rank)
                {
                    winningCard = card;
                    winningCardIndex = i;
                }
            }
        }

        return trick.PlayOrder[winningCardIndex];
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
        if (currentRound.CanEndEarly && currentRound.EarlyEndCondition != null)
        {
            return currentRound.EarlyEndCondition(match.CurrentRoundTricks);
        }

        return false;
    }

    private void EndRound(KingMatch match)
    {
        match.Phase = KingGamePhase.RoundEnd;
        
        var currentRound = match.CurrentRound;
        if (currentRound?.ScoreCalculator != null)
        {
            // Calculate scores for this round
            foreach (var player in match.Players)
            {
                var roundScore = currentRound.ScoreCalculator(player, match.CurrentRoundTricks);
                player.Score += roundScore;
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
            CurrentTrick = match.CurrentTrick,
            CurrentTrickPlayerOrder = match.CurrentTrickPlayerOrder,
            CreatorPlayerId = match.Players.FirstOrDefault()?.Id,
            TotalRounds = match.GameRounds.Count,
            MustDiscardKingOfHearts = match.MustDiscardKingOfHearts
        };

        // Set player's hand
        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            state.YourHand = requestingPlayer.Hand.ToList();
        }

        // Trump selection logic
        if (currentRound?.RequiresTrumpSelection == true)
        {
            var playerIndex = GetPlayerIndex(match, requestingPlayerId);
            state.CanSelectTrump = playerIndex == match.TrumpSetterIndex && match.CurrentTrump == null;
            state.WaitingForTrumpSelection = match.CurrentTrump == null;
            state.AvailableTrumpSuits = Enum.GetValues<KingSuit>().ToList();
        }

        return state;
    }

    private int GetPlayerIndex(KingMatch match, Guid playerId)
    {
        for (int i = 0; i < match.Players.Count; i++)
        {
            if (match.Players[i].Id == playerId)
                return i;
        }
        return -1;
    }
}