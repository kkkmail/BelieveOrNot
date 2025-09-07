// King/KingGameEngine.cs
namespace BelieveOrNot.Server.King;

public class KingGameEngine : IKingGameEngine
{
    private readonly Random _random = new();

    public KingGameStateDto StartNewRound(KingMatch match)
    {
        if (match.Players.Count != 4)
        {
            throw new InvalidOperationException("King game requires exactly 4 players");
        }

        if (match.IsGameComplete)
        {
            throw new InvalidOperationException("Game is already complete");
        }

        var currentRound = match.CurrentRound;
        if (currentRound == null)
        {
            throw new InvalidOperationException("No more rounds to play");
        }

        // Deal cards for new round
        DealCards(match);

        // Reset round state
        match.CompletedTricks.Clear();
        match.CurrentTrick = null;
        match.WaitingForTrumpSelection = false;
        match.SelectedTrumpSuit = null;

        // Set round leader (rotates each round)
        match.RoundLeaderIndex = (match.RoundLeaderIndex + 1) % match.Players.Count;
        match.CurrentPlayerIndex = match.RoundLeaderIndex;

        // Check if we need trump selection for collecting phase
        if (currentRound.IsCollectingPhase)
        {
            match.WaitingForTrumpSelection = true;
            // Current player should be the trump chooser
            var trumpChooser = match.Players.FirstOrDefault(p => p.Id == currentRound.TrumpChooser);
            if (trumpChooser != null)
            {
                match.CurrentPlayerIndex = match.Players.IndexOf(trumpChooser);
            }
        }
        else
        {
            // Start first trick for avoiding rounds
            StartNewTrick(match);
        }

        match.Phase = GamePhase.InProgress;

        return CreateGameStateDto(match);
    }

    public KingGameStateDto PlayCard(KingMatch match, Guid playerId, Card card)
    {
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            throw new InvalidOperationException("Player not found");
        }

        if (!KingMoveValidator.IsValidCardPlay(match, player, card))
        {
            throw new InvalidOperationException("Invalid card play");
        }

        // Remove card from player's hand
        player.Hand.Remove(card);

        // Add card to current trick
        var currentTrick = match.CurrentTrick!;
        currentTrick.Cards.Add(new PlayedCard
        {
            Card = card,
            PlayerId = playerId,
            PlayOrder = currentTrick.Cards.Count
        });

        // Set lead suit for first card
        if (currentTrick.Cards.Count == 1)
        {
            currentTrick.LedSuit = card.GetSuit();
        }

        // Check if trick is complete
        if (currentTrick.IsComplete)
        {
            CompleteTrick(match);

            // Check for round end conditions
            if (ShouldEndRound(match))
            {
                EndRound(match);
            }
            else if (!match.IsRoundComplete)
            {
                StartNewTrick(match);
            }
        }
        else
        {
            // Advance to next player
            AdvanceCurrentPlayer(match);
        }

        return CreateGameStateDto(match);
    }

    public KingGameStateDto SelectTrump(KingMatch match, Guid playerId, Suit trumpSuit)
    {
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            throw new InvalidOperationException("Player not found");
        }

        if (!KingMoveValidator.IsValidTrumpSelection(match, player, trumpSuit))
        {
            throw new InvalidOperationException("Invalid trump selection");
        }

        match.SelectedTrumpSuit = trumpSuit;
        match.CurrentRound!.TrumpSuit = trumpSuit;
        match.WaitingForTrumpSelection = false;

        // Start first trick
        StartNewTrick(match);

        return CreateGameStateDto(match);
    }

    private void DealCards(KingMatch match)
    {
        // Clear all hands
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }

        // Build and shuffle deck (32 cards for King game)
        var deck = DeckBuilder.BuildDeck(DeckSize.Small);
        DeckBuilder.Shuffle(deck, _random);

        // Deal 8 cards to each player
        for (int i = 0; i < deck.Count; i++)
        {
            var playerIndex = i % 4;
            match.Players[playerIndex].Hand.Add(deck[i]);
        }
    }

    private void StartNewTrick(KingMatch match)
    {
        var trickNumber = match.CompletedTricks.Count + 1;
        match.CurrentTrick = new Trick
        {
            TrickNumber = trickNumber
        };
    }

    private void CompleteTrick(KingMatch match)
    {
        var trick = match.CurrentTrick!;
        var winningCard = trick.GetWinningCard(match.SelectedTrumpSuit);

        if (winningCard != null)
        {
            trick.WinnerId = winningCard.PlayerId;

            // Winner leads next trick
            var winnerIndex = match.Players.FindIndex(p => p.Id == winningCard.PlayerId);
            match.CurrentPlayerIndex = winnerIndex;
        }

        match.CompletedTricks.Add(trick);
        match.CurrentTrick = null;
    }

    private bool ShouldEndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound!;

        // Check early termination conditions
        if (KingScorer.ShouldEndRoundEarly(match, currentRound))
        {
            return true;
        }

        // Round ends when all 8 tricks are complete
        return match.IsRoundComplete;
    }

    private void EndRound(KingMatch match)
    {
        var currentRound = match.CurrentRound!;

        // Calculate scores for this round
        var roundScores = KingScorer.CalculateRoundScores(match, currentRound);

        // Add to player totals
        foreach (var player in match.Players)
        {
            player.Score += roundScores[player.Id];
        }

        // Move to next round
        match.CurrentRoundIndex++;

        if (match.IsGameComplete)
        {
            match.Phase = GamePhase.GameEnd;
        }
        else
        {
            match.Phase = GamePhase.RoundEnd;
        }
    }

    private void AdvanceCurrentPlayer(KingMatch match)
    {
        match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
    }

    public KingGameStateDto CreateGameStateDto(KingMatch match)
    {
        return new KingGameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new KingPlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            CurrentPlayerIndex = match.CurrentPlayerIndex,
            CurrentRoundIndex = match.CurrentRoundIndex,
            CurrentRound = match.CurrentRound,
            CompletedTricks = match.CompletedTricks,
            CurrentTrick = match.CurrentTrick,
            WaitingForTrumpSelection = match.WaitingForTrumpSelection,
            SelectedTrumpSuit = match.SelectedTrumpSuit
        };
    }

    public KingGameStateDto CreateGameStateDtoForPlayer(KingMatch match, Guid playerId)
    {
        var state = CreateGameStateDto(match);

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player != null)
        {
            state.YourHand = player.Hand.ToList();
        }

        return state;
    }
}
