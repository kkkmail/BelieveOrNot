public class GameEngine : IGameEngine
{
    private readonly Random _random = new();
    private readonly IMatchManager _matchManager;

    // Constructor for dependency injection
    public GameEngine(IMatchManager matchManager)
    {
        _matchManager = matchManager;
    }

    public GameStateDto StartNewRound(Match match)
    {
        if (match.Players.Count < 2)
        {
            throw new InvalidOperationException("Need at least 2 players to start a round");
        }

        // FIXED: Shuffle players (except creator) at the beginning of each new round
        _matchManager.ShufflePlayersForNewRound(match);

        var deck = DeckBuilder.BuildDeck(match.Settings.DeckSize, match.Settings.JokerCount);
        DeckBuilder.Shuffle(deck, _random);

        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        int playerCount = match.Players.Count;
        for (int cardIndex = 0; cardIndex < deck.Count; cardIndex++)
        {
            var playerIndex = cardIndex % playerCount;
            match.Players[playerIndex].Hand.Add(deck[cardIndex]);
        }

        var disposalEvents = new List<string>();
        foreach (var player in match.Players)
        {
            var disposedRanks = AutoDisposeFourOfAKind(player);
            disposalEvents.AddRange(disposedRanks);
        }

        match.CurrentPlayerIndex = (match.DealerIndex + 1) % match.Players.Count;
        match.Phase = GamePhase.InProgress;
        match.RoundNumber++;

        var roundStartMessage = $"🎯 Round {match.RoundNumber} started!";
        if (disposalEvents.Any())
        {
            roundStartMessage += " " + string.Join(" ", disposalEvents);
        }

        var state = CreateGameStateDto(match, Guid.Empty);
        state.LastAction = roundStartMessage;
        return state;
    }

    // ... rest of the methods remain the same as in the previous artifact
    public GameStateDto CreateGameStateDtoForPlayer(Match match, Guid playerId)
    {
        return CreateGameStateDto(match, playerId);
    }

    public GameStateDto SubmitMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (!IsValidMove(match, playerId, request))
        {
            throw new InvalidOperationException("Invalid move");
        }

        var player = match.Players.First(p => p.Id == playerId);
        var result = string.Empty;

        if (request.Action == ActionType.Play)
        {
            HandlePlayAction(match, player, request, out result);
        }
        else if (request.Action == ActionType.Challenge)
        {
            HandleChallengeAction(match, player, request, out result);
        }

        var state = CreateGameStateDto(match, playerId);
        state.LastAction = result;
        return state;
    }

    private void HandlePlayAction(Match match, Player player, SubmitMoveRequest request, out string result)
    {
        var cardsToRemove = new List<Card>();
        foreach (var requestedCard in request.Cards!)
        {
            var cardInHand = player.Hand.FirstOrDefault(c =>
                c.Rank == requestedCard.Rank && c.Suit == requestedCard.Suit);
            if (cardInHand != null)
            {
                cardsToRemove.Add(cardInHand);
            }
        }

        foreach (var card in cardsToRemove)
        {
            player.Hand.Remove(card);
        }

        match.TablePile.AddRange(request.Cards!);
        match.LastPlayCardCount = request.Cards!.Count;

        if (match.AnnouncedRank == null)
        {
            match.AnnouncedRank = request.DeclaredRank;
        }

        var disposalEvents = AutoDisposeFourOfAKind(player);

        if (player.Hand.Count == 0)
        {
            result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank} and has NO CARDS LEFT! Game continues.";
        }
        else
        {
            result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank}.";
        }

        if (disposalEvents.Any())
        {
            result += " " + string.Join(" ", disposalEvents);
        }

        AdvanceToNextActivePlayer(match);
    }

    private void HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request, out string result)
    {
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var flippedCard = match.TablePile[cardIndex];

        var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
        var challengedPlayer = match.Players[prevPlayerIndex];

        var challengeDetails = $"{challenger.Name} challenges {challengedPlayer.Name} (card {request.ChallengePickIndex!.Value + 1} of {match.LastPlayCardCount}).";

        bool challengeHit = flippedCard.Rank == match.AnnouncedRank || flippedCard.IsJoker;

        Player collector;
        string challengeResult;

        if (challengeHit)
        {
            collector = challenger;
            if (flippedCard.IsJoker)
            {
                challengeResult = $"Challenged card was {flippedCard} (Joker matches {match.AnnouncedRank}). {challenger.Name} was wrong and collects all cards.";
            }
            else
            {
                challengeResult = $"Challenged card was {flippedCard} (matches {match.AnnouncedRank}). {challenger.Name} was wrong and collects all cards.";
            }
        }
        else
        {
            collector = challengedPlayer;
            challengeResult = $"Challenged card was {flippedCard} (does not match {match.AnnouncedRank}). {challenger.Name} was right, {challengedPlayer.Name} collects all cards.";
        }

        var collectedCount = match.TablePile.Count;
        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        var disposalEvents = AutoDisposeFourOfAKind(collector);

        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = collectorIndex;

        result = challengeDetails + " " + challengeResult;
        if (disposalEvents.Any())
        {
            result += " " + string.Join(" ", disposalEvents);
        }

        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();
        if (playersWithNoCards.Any())
        {
            EndRound(match);
            if (!string.IsNullOrEmpty(match.LastRoundEndMessage))
            {
                result += " " + match.LastRoundEndMessage;
            }
        }
        else
        {
            AdvanceToNextActivePlayer(match);
        }
    }

    private List<string> AutoDisposeFourOfAKind(Player player)
    {
        var disposalEvents = new List<string>();
        var groups = player.Hand.Where(c => !c.IsJoker)
            .GroupBy(c => c.Rank)
            .Where(g => g.Count() >= 4)
            .ToList();

        foreach (var group in groups)
        {
            var cardsToRemove = group.Take(4).ToList();
            foreach (var card in cardsToRemove)
            {
                player.Hand.Remove(card);
            }
            disposalEvents.Add($"{player.Name} disposed 4 of a kind: {group.Key}s.");
        }

        return disposalEvents;
    }

    private void AdvanceToNextActivePlayer(Match match)
    {
        int attempts = 0;
        int maxAttempts = match.Players.Count;

        do
        {
            match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
            attempts++;

            if (attempts >= maxAttempts)
            {
                Console.WriteLine("WARNING: All players have 0 cards but round hasn't ended - this shouldn't happen");
                break;
            }
        } while (match.Players[match.CurrentPlayerIndex].Hand.Count == 0);
    }

    private void EndRound(Match match)
    {
        if (match.Phase == GamePhase.RoundEnd)
        {
            Console.WriteLine("WARNING: EndRound called but round already ended - skipping to prevent double scoring");
            return;
        }

        match.Phase = GamePhase.RoundEnd;
        var roundResults = new List<string>();
        var winners = new List<Player>();

        foreach (var player in match.Players)
        {
            int regularCards = player.Hand.Count(c => !c.IsJoker);
            int jokerCards = player.Hand.Count(c => c.IsJoker);

            var roundScore = 0;
            var regularCardPenalty = regularCards * match.Settings.ScorePerCard;
            var jokerCardPenalty = jokerCards * match.Settings.ScorePerJoker;

            roundScore += regularCardPenalty;
            roundScore += jokerCardPenalty;

            if (player.Hand.Count == 0)
            {
                roundScore += match.Settings.WinnerBonus;
                match.DealerIndex = match.Players.IndexOf(player);
                winners.Add(player);
            }

            player.Score += roundScore;

            if (player.Hand.Count == 0)
            {
                roundResults.Add($"{player.Name}: +{roundScore} points (Winner bonus: +{match.Settings.WinnerBonus}, 0 cards)");
            }
            else
            {
                var cardPenalties = new List<string>();
                if (regularCards > 0)
                {
                    cardPenalties.Add($"{regularCards} cards: {regularCardPenalty}");
                }
                if (jokerCards > 0)
                {
                    cardPenalties.Add($"{jokerCards} jokers: {jokerCardPenalty}");
                }
                roundResults.Add($"{player.Name}: {roundScore} points ({string.Join(", ", cardPenalties)})");
            }
        }

        string roundEndMessage;
        if (winners.Count == 1)
        {
            roundEndMessage = $"🏁 Round {match.RoundNumber} ended! {winners[0].Name} wins!";
        }
        else if (winners.Count > 1)
        {
            var winnerNames = string.Join(", ", winners.Select(w => w.Name));
            roundEndMessage = $"🏁 Round {match.RoundNumber} ended! Winners: {winnerNames}";
        }
        else
        {
            roundEndMessage = $"🏁 Round {match.RoundNumber} ended!";
        }

        roundEndMessage += " Scoring: " + string.Join(", ", roundResults);
        match.LastRoundEndMessage = roundEndMessage;

        Console.WriteLine($"Round ended: {roundEndMessage}");
    }

    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;

        if (request.Action == ActionType.Play)
        {
            if (player.Hand.Count == 0) return false;

            var currentPlayer = match.Players[match.CurrentPlayerIndex];
            if (currentPlayer.Id != playerId) return false;

            // FIXED: If only 1 active player remains (others have 0 cards), they cannot play more cards
            var activePlayers = match.Players.Where(p => p.Hand.Count > 0).ToList();
            var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();

            if (activePlayers.Count == 1 && playersWithNoCards.Any())
            {
                Console.WriteLine($"VALIDATION: Only 1 active player remaining ({player.Name}) - blocking play action");
                return false; // Cannot play cards when you're the last active player
            }

            if (request.Cards == null || request.Cards.Count < 1 || request.Cards.Count > 3)
                return false;

            var playerCardCounts = new Dictionary<(string rank, string suit), int>();
            foreach (var card in player.Hand)
            {
                var key = (card.Rank, card.Suit);
                playerCardCounts[key] = playerCardCounts.GetValueOrDefault(key, 0) + 1;
            }

            var requestedCardCounts = new Dictionary<(string rank, string suit), int>();
            foreach (var card in request.Cards)
            {
                var key = (card.Rank, card.Suit);
                requestedCardCounts[key] = requestedCardCounts.GetValueOrDefault(key, 0) + 1;
            }

            foreach (var kvp in requestedCardCounts)
            {
                if (!playerCardCounts.ContainsKey(kvp.Key) ||
                    playerCardCounts[kvp.Key] < kvp.Value)
                {
                    return false;
                }
            }

            if (match.AnnouncedRank == null)
            {
                return !string.IsNullOrEmpty(request.DeclaredRank);
            }

            return true;
        }
        else if (request.Action == ActionType.Challenge)
        {
            if (player.Hand.Count == 0) return false;

            if (match.TablePile.Count == 0 || match.AnnouncedRank == null)
                return false;

            if (!request.ChallengePickIndex.HasValue)
                return false;

            var pickIndex = request.ChallengePickIndex.Value;
            return pickIndex >= 0 && pickIndex < match.LastPlayCardCount;
        }

        return false;
    }

    private GameStateDto CreateGameStateDto(Match match, Guid requestingPlayerId)
    {
        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            TablePileCount = match.TablePile.Count,
            LastPlayCardCount = match.LastPlayCardCount,
            AnnouncedRank = match.AnnouncedRank,
            CurrentPlayerIndex = match.CurrentPlayerIndex,
            RoundNumber = match.RoundNumber,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            DeckSize = match.Settings.DeckSize,
            JokerCount = match.Settings.JokerCount,
        };

        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            state.YourHand = requestingPlayer.Hand.Select(c => new Card(c.Rank, c.Suit)).ToList();
        }

        return state;
    }
}
