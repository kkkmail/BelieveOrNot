// Server/GameEngine.cs
public class GameEngine : IGameEngine
{
    private readonly Random _random = new();
    private readonly IMatchManager _matchManager;

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
        match.DisposedRanks.Clear(); // Reset disposed ranks for new round

        int playerCount = match.Players.Count;
        for (int cardIndex = 0; cardIndex < deck.Count; cardIndex++)
        {
            var playerIndex = cardIndex % playerCount;
            match.Players[playerIndex].Hand.Add(deck[cardIndex]);
        }

        var disposalMessages = new List<string>();
        foreach (var player in match.Players)
        {
            var disposedRanks = AutoDisposeFourOfAKind(player, match);
            foreach (var rank in disposedRanks)
            {
                var disposalEvent = GameEventFactory.CreateDisposalEvent(player.Name, rank);
                disposalMessages.Add(disposalEvent.DisplayMessage);
            }
        }

        match.CurrentPlayerIndex = (match.DealerIndex + 1) % match.Players.Count;
        match.Phase = GamePhase.InProgress;
        match.RoundNumber++;

        var state = CreateGameStateDto(match, Guid.Empty);
        state.Event = GameEventFactory.CreateRoundStartEvent(match.RoundNumber, disposalMessages);
        return state;
    }

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

        GameEventDto gameEvent = request.Action switch
        {
            ActionType.Play => HandlePlayAction(match, player, request),
            ActionType.Challenge => HandleChallengeAction(match, player, request),
            _ => throw new InvalidOperationException($"Unknown action type: {request.Action}")
        };

        var state = CreateGameStateDto(match, playerId);
        state.Event = gameEvent;
        return state;
    }

    private GameEventDto HandlePlayAction(Match match, Player player, SubmitMoveRequest request)
    {
        // Remove cards from player's hand
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

        // Add cards to table pile
        match.TablePile.AddRange(request.Cards!);
        match.LastPlayCardCount = request.Cards!.Count;

        // Set announced rank if this is the opening play
        if (match.AnnouncedRank == null)
        {
            match.AnnouncedRank = request.DeclaredRank;
        }

        // Handle automatic disposal of four-of-a-kind
        var disposalEvents = AutoDisposeFourOfAKind(player, match);

        var cardPlayEvent = GameEventFactory.CreateCardPlayEvent(
            player.Name,
            request.Cards!,
            match.AnnouncedRank!,
            player.Hand.Count
        );

        // Add disposal messages if any occurred
        if (disposalEvents.Any())
        {
            var disposalMessages = disposalEvents.Select(rank =>
                GameEventFactory.CreateDisposalEvent(player.Name, rank).DisplayMessage);
            cardPlayEvent.DisplayMessage += " " + string.Join(" ", disposalMessages);
        }

        AdvanceToNextActivePlayer(match);
        return cardPlayEvent;
    }

    private GameEventDto HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request)
    {
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var revealedCard = match.TablePile[cardIndex];

        var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
        var challengedPlayer = match.Players[prevPlayerIndex];

        bool isMatch = revealedCard.Rank == match.AnnouncedRank || revealedCard.IsJoker;
        bool challengerWasRight = !isMatch;

        // Determine who collects the cards
        Player collector = challengerWasRight ? challengedPlayer : challenger;

        var collectedCount = match.TablePile.Count;

        // FIXED: Store the announced rank, last play count, AND table cards BEFORE clearing them
        var currentAnnouncedRank = match.AnnouncedRank ?? "Unknown";
        var currentLastPlayCount = match.LastPlayCardCount;
        var allTableCards = new List<Card>(match.TablePile); // Copy before clearing

        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        // Handle automatic disposal
        var disposalEvents = AutoDisposeFourOfAKind(collector, match);

        // Set current player to the collector
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = collectorIndex;

        // FIXED: Pass all table cards to include remaining cards data
        var challengeEvent = GameEventFactory.CreateChallengeEvent(
            challenger.Name,
            challengedPlayer.Name,
            request.ChallengePickIndex!.Value,
            currentLastPlayCount,
            revealedCard,
            currentAnnouncedRank,
            isMatch,
            collector.Name,
            collectedCount,
            allTableCards // NEW: Pass all table cards for remaining cards extraction
        );

        // Add disposal messages if any occurred
        if (disposalEvents.Any())
        {
            var disposalMessages = disposalEvents.Select(rank =>
                GameEventFactory.CreateDisposalEvent(collector.Name, rank).DisplayMessage);
            challengeEvent.DisplayMessage += " " + string.Join(" ", disposalMessages);
        }

        // Check if round should end
        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();
        if (playersWithNoCards.Any())
        {
            EndRound(match);
        }
        else
        {
            AdvanceToNextActivePlayer(match);
        }

        return challengeEvent;
    }

    private List<string> AutoDisposeFourOfAKind(Player player, Match match)
    {
        var disposedRanks = new List<string>();
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
            disposedRanks.Add(group.Key);
            match.DisposedRanks.Add(group.Key); // Track disposed rank
        }

        return disposedRanks;
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
                Console.WriteLine("WARNING: All players have 0 cards but round hasn't ended");
                break;
            }
        } while (match.Players[match.CurrentPlayerIndex].Hand.Count == 0);
    }

    private void EndRound(Match match)
    {
        if (match.Phase == GamePhase.RoundEnd)
        {
            Console.WriteLine("WARNING: EndRound called but round already ended - skipping");
            return;
        }

        match.Phase = GamePhase.RoundEnd;
        var scoreResults = new List<PlayerScoreResult>();
        var winners = new List<Player>();

        foreach (var player in match.Players)
        {
            int regularCards = player.Hand.Count(c => !c.IsJoker);
            int jokerCards = player.Hand.Count(c => c.IsJoker);

            var regularCardPenalty = regularCards * match.Settings.ScorePerCard;
            var jokerCardPenalty = jokerCards * match.Settings.ScorePerJoker;
            var winnerBonus = 0;

            if (player.Hand.Count == 0)
            {
                winnerBonus = match.Settings.WinnerBonus;
                match.DealerIndex = match.Players.IndexOf(player);
                winners.Add(player);
            }

            var roundScore = regularCardPenalty + jokerCardPenalty + winnerBonus;
            player.Score += roundScore;

            scoreResults.Add(new PlayerScoreResult
            {
                PlayerName = player.Name,
                ScoreChange = roundScore,
                TotalScore = player.Score,
                IsWinner = player.Hand.Count == 0,
                RegularCards = regularCards,
                JokerCards = jokerCards,
                WinnerBonus = winnerBonus
            });
        }

        var roundEndEvent = GameEventFactory.CreateRoundEndEvent(
            match.RoundNumber,
            winners.Select(w => w.Name).ToList(),
            scoreResults
        );

        Console.WriteLine($"Round {match.RoundNumber} ended: {roundEndEvent.DisplayMessage}");
    }

    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;

        return request.Action switch
        {
            ActionType.Play => IsValidPlayAction(match, player, request),
            ActionType.Challenge => IsValidChallengeAction(match, player, request),
            _ => false
        };
    }

    private bool IsValidPlayAction(Match match, Player player, SubmitMoveRequest request)
    {
        if (player.Hand.Count == 0) return false;

        var currentPlayer = match.Players[match.CurrentPlayerIndex];
        if (currentPlayer.Id != player.Id) return false;

        // Check if only one active player remains
        var activePlayers = match.Players.Where(p => p.Hand.Count > 0).ToList();
        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();

        if (activePlayers.Count == 1 && playersWithNoCards.Any())
        {
            Console.WriteLine($"VALIDATION: Only 1 active player remaining ({player.Name}) - blocking play");
            return false;
        }

        if (request.Cards == null || request.Cards.Count < 1 || request.Cards.Count > 3)
            return false;

        // Verify player has the requested cards
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

        // For opening turn, declared rank must be provided
        if (match.AnnouncedRank == null)
        {
            return !string.IsNullOrEmpty(request.DeclaredRank);
        }

        return true;
    }

    private bool IsValidChallengeAction(Match match, Player player, SubmitMoveRequest request)
    {
        if (player.Hand.Count == 0) return false;
        if (match.TablePile.Count == 0 || match.AnnouncedRank == null) return false;
        if (!request.ChallengePickIndex.HasValue) return false;

        var pickIndex = request.ChallengePickIndex.Value;
        return pickIndex >= 0 && pickIndex < match.LastPlayCardCount;
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
            DisposedRanks = match.DisposedRanks.ToList(), // Include disposed ranks
            CreatorPlayerId = match.Players[0].Id
        };

        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            state.YourHand = requestingPlayer.Hand.Select(c => new Card(c.Rank, c.Suit)).ToList();
        }

        return state;
    }
}
