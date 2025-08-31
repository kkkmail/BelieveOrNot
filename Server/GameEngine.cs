public class GameEngine : IGameEngine
{
    private readonly Random _random = new();
    
    public GameStateDto StartNewRound(Match match)
    {
        if (match.Players.Count < 2)
        {
            throw new InvalidOperationException("Need at least 2 players to start a round");
        }

        // Build and shuffle deck ONCE
        var deck = DeckBuilder.BuildDeck(match.Settings.DeckSize, match.Settings.JokerCount);
        DeckBuilder.Shuffle(deck, _random);

        // Clear hands and table
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        // Deal cards properly - one at a time to each player in rotation
        int playerCount = match.Players.Count;
        for (int cardIndex = 0; cardIndex < deck.Count; cardIndex++)
        {
            var playerIndex = cardIndex % playerCount;
            match.Players[playerIndex].Hand.Add(deck[cardIndex]);
        }

        // Auto-dispose four-of-a-kinds
        foreach (var player in match.Players)
        {
            AutoDisposeFourOfAKind(player);
        }

        // Set current player (left of dealer)
        match.CurrentPlayerIndex = (match.DealerIndex + 1) % match.Players.Count;
        match.Phase = GamePhase.InProgress;
        match.RoundNumber++;

        return CreateGameStateDto(match, Guid.Empty);
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
        var result = string.Empty;
        
        if (request.Action == ActionType.Play)
        {
            HandlePlayAction(match, player, request, out result);
        }
        else if (request.Action == ActionType.Challenge)
        {
            HandleChallengeAction(match, player, request, out result);
        }
        
        // Check for round end
        if (match.Players.Any(p => p.Hand.Count == 0))
        {
            EndRound(match);
            result += " Round ended!";
        }
        
        var state = CreateGameStateDto(match, playerId);
        state.LastAction = result;
        return state;
    }
    
    private void HandlePlayAction(Match match, Player player, SubmitMoveRequest request, out string result)
    {
        // Remove cards from player's hand - create copies to avoid reference issues
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
        
        // Actually remove the cards
        foreach (var card in cardsToRemove)
        {
            player.Hand.Remove(card);
        }
        
        // Add the requested cards to table pile (not the ones from hand)
        match.TablePile.AddRange(request.Cards!);
        match.LastPlayCardCount = request.Cards!.Count;
        
        // Set announced rank if opening turn
        if (match.AnnouncedRank == null)
        {
            match.AnnouncedRank = request.DeclaredRank;
        }
        
        // Auto-dispose four-of-a-kind after play
        AutoDisposeFourOfAKind(player);
        
        // Next player's turn
        match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
        
        result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank}";
    }
    
    private void HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request, out string result)
    {
        // Find the card to flip (from last play)
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var flippedCard = match.TablePile[cardIndex];
        
        // Determine if challenge succeeded
        bool challengeHit = flippedCard.Rank == match.AnnouncedRank;
        
        // Determine who collects the pile
        Player collector;
        if (challengeHit)
        {
            // Challenger was wrong, they collect
            collector = challenger;
            result = $"{challenger.Name} challenged and was wrong! {flippedCard} matched {match.AnnouncedRank}";
        }
        else
        {
            // Previous player was lying, they collect
            var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
            collector = match.Players[prevPlayerIndex];
            result = $"{challenger.Name} challenged and was right! {flippedCard} didn't match {match.AnnouncedRank}";
        }
        
        // Collector takes all cards
        var collectedCount = match.TablePile.Count;
        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        
        // Auto-dispose four-of-a-kind after collection
        AutoDisposeFourOfAKind(collector);
        
        // Next turn goes to left of collector
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = (collectorIndex + 1) % match.Players.Count;
        
        result += $" {collector.Name} collected {collectedCount} cards";
    }
    
    private void AutoDisposeFourOfAKind(Player player)
    {
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
        }
    }
    
    private void EndRound(Match match)
    {
        match.Phase = GamePhase.RoundEnd;
        
        // Calculate scores
        foreach (var player in match.Players)
        {
            var roundScore = 0;
            
            // Points for remaining cards
            foreach (var card in player.Hand)
            {
                if (card.IsJoker)
                    roundScore += match.Settings.ScorePerJoker;
                else
                    roundScore += match.Settings.ScorePerCard;
            }
            
            // Winner bonus
            if (player.Hand.Count == 0)
            {
                roundScore += match.Settings.WinnerBonus;
                match.DealerIndex = match.Players.IndexOf(player); // Winner becomes next dealer
            }
            
            player.Score += roundScore;
        }
    }
    
    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;
        
        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;
        
        if (request.Action == ActionType.Play)
        {
            // For play actions, must be current player's turn
            var currentPlayer = match.Players[match.CurrentPlayerIndex];
            if (currentPlayer.Id != playerId) return false;
            
            // Validate play action
            if (request.Cards == null || request.Cards.Count < 1 || request.Cards.Count > 3)
                return false;
            
            // Check player has these cards - count how many of each card type they have
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
            
            // Verify player has enough of each requested card type
            foreach (var kvp in requestedCardCounts)
            {
                if (!playerCardCounts.ContainsKey(kvp.Key) || 
                    playerCardCounts[kvp.Key] < kvp.Value)
                {
                    return false;
                }
            }
            
            // Opening turn must declare rank
            if (match.AnnouncedRank == null)
            {
                return !string.IsNullOrEmpty(request.DeclaredRank);
            }
            
            return true;
        }
        else if (request.Action == ActionType.Challenge)
        {
            // Can challenge if there's a table pile with announced rank
            // Any player can challenge (not just current player)
            if (match.TablePile.Count == 0 || match.AnnouncedRank == null)
                return false;
            
            // Must specify valid pick index within last play
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
            }).ToList()
        };
        
        // Include requesting player's hand
        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            // Create a copy to avoid reference issues
            state.YourHand = requestingPlayer.Hand.Select(c => new Card(c.Rank, c.Suit)).ToList();
        }
        
        return state;
    }
}