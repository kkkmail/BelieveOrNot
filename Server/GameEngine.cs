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

        // Check if player reached zero cards and announce it
        if (player.Hand.Count == 0)
        {
            result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank} and has NO CARDS LEFT! 🎯 {player.Name} is out of cards but the round continues!";
        }
        else
        {
            result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank}";
        }

        // Advance to next active player (skip players with 0 cards)
        AdvanceToNextActivePlayer(match);
    }

    private void HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request, out string result)
    {
        // Debug: Print entire table pile contents
        Console.WriteLine("=== CHALLENGE DEBUG ===");
        Console.WriteLine($"Total cards in pile: {match.TablePile.Count}");
        Console.WriteLine($"Last play count: {match.LastPlayCardCount}");
        Console.WriteLine($"Challenge pick index: {request.ChallengePickIndex!.Value}");

        Console.WriteLine("Table pile contents:");
        for (int i = 0; i < match.TablePile.Count; i++)
        {
            Console.WriteLine($"  Index {i}: {match.TablePile[i]}");
        }

        // Find the card to flip (from last play)
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        Console.WriteLine(
            $"Calculated card index: {match.TablePile.Count} - {match.LastPlayCardCount} + {request.ChallengePickIndex!.Value} = {cardIndex}");

        if (cardIndex < 0 || cardIndex >= match.TablePile.Count)
        {
            Console.WriteLine($"ERROR: Card index {cardIndex} is out of bounds!");
            result = "Challenge failed: Invalid card selection";
            return;
        }

        var flippedCard = match.TablePile[cardIndex];
        Console.WriteLine($"Flipped card: {flippedCard}");
        Console.WriteLine($"Announced rank: {match.AnnouncedRank}");

        // Determine if challenge succeeded
        bool challengeHit = flippedCard.Rank == match.AnnouncedRank || flippedCard.IsJoker;
        Console.WriteLine(
            $"Challenge hit: {challengeHit} (card rank: {flippedCard.Rank}, announced: {match.AnnouncedRank}, is joker: {flippedCard.IsJoker})");

        // Get the player who was challenged (the one who played last)
        var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
        var challengedPlayer = match.Players[prevPlayerIndex];
        Console.WriteLine($"Challenger: {challenger.Name}, Challenged player: {challengedPlayer.Name}");

        // Determine who collects the pile
        Player collector;
        if (challengeHit)
        {
            // Challenger was wrong, they collect
            collector = challenger;
            if (flippedCard.IsJoker)
            {
                result = $"CHALLENGE RESULT: {challenger.Name} challenged {challengedPlayer.Name} and was WRONG! " +
                         $"Flipped card was {flippedCard} (Joker matches any rank including {match.AnnouncedRank}). " +
                         $"{challenger.Name} collects the pile.";
            }
            else
            {
                result = $"CHALLENGE RESULT: {challenger.Name} challenged {challengedPlayer.Name} and was WRONG! " +
                         $"Flipped card was {flippedCard} which matched the announced rank {match.AnnouncedRank}. " +
                         $"{challenger.Name} collects the pile.";
            }
        }
        else
        {
            // Challenger was right, challenged player collects
            collector = challengedPlayer;
            result = $"CHALLENGE RESULT: {challenger.Name} challenged {challengedPlayer.Name} and was RIGHT! " +
                     $"Flipped card was {flippedCard} which did NOT match the announced rank {match.AnnouncedRank}. " +
                     $"{challengedPlayer.Name} collects the pile.";
        }

        Console.WriteLine($"Collector: {collector.Name}");

        // Collector takes all cards
        var collectedCount = match.TablePile.Count;
        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;

        // Auto-dispose four-of-a-kind after collection
        AutoDisposeFourOfAKind(collector);

        // Set current player to collector, then advance to next active player
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = collectorIndex;
        AdvanceToNextActivePlayer(match);

        // CHECK FOR ROUND END AFTER CHALLENGE RESOLUTION
        // This is the natural point where rounds can end - after challenge resolution
        var playersWithNoCards = match.Players.Where(p => p.Hand.Count == 0).ToList();
        if (playersWithNoCards.Any())
        {
            EndRound(match);
            // Combine challenge result with round end message
            result += " " + (match.LastRoundEndMessage ?? "Round ended!");
        }

        Console.WriteLine($"Final result: {result}");
        Console.WriteLine("=== END CHALLENGE DEBUG ===");
    }

    // private void AdvanceToNextActivePlayer(Match match)
    // {
    //     int attempts = 0;
    //     int maxAttempts = match.Players.Count;
    //
    //     do
    //     {
    //         match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
    //         attempts++;
    //
    //         // If we've checked all players and none have cards, something is wrong
    //         if (attempts >= maxAttempts)
    //         {
    //             // This should trigger round end - all players are out
    //             break;
    //         }
    //     } while (match.Players[match.CurrentPlayerIndex].Hand.Count == 0);
    // }

    private void AdvanceToNextActivePlayer(Match match)
    {
        int attempts = 0;
        int maxAttempts = match.Players.Count;

        do
        {
            match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
            attempts++;

            // If we've checked all players and none have cards, end the round
            if (attempts >= maxAttempts)
            {
                // All players have 0 cards - this shouldn't happen normally but is a safety net
                Console.WriteLine("All players have 0 cards - ending round");
                EndRound(match);
                break;
            }
        } while (match.Players[match.CurrentPlayerIndex].Hand.Count == 0);

        // Additional check: If only 1 active player remains and there are cards on table,
        // they must challenge (covered by existing 2-player rule logic)
        var activePlayers = match.Players.Where(p => p.Hand.Count > 0).ToList();
        if (activePlayers.Count == 1 && match.TablePile.Count > 0)
        {
            Console.WriteLine($"Only 1 active player ({activePlayers[0].Name}) remains with cards on table - they must challenge");
            // The UI logic should handle forcing the challenge
        }
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

        var roundResults = new List<string>();
        var winners = new List<Player>();

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
                winners.Add(player);
            }

            player.Score += roundScore;

            // Add to round results
            if (player.Hand.Count == 0)
            {
                roundResults.Add($"🏆 {player.Name}: {roundScore} points (Winner bonus + no cards)");
            }
            else
            {
                roundResults.Add($"📊 {player.Name}: {roundScore} points ({player.Hand.Count} cards remaining)");
            }
        }

        // Create round end message
        string roundEndMessage;
        if (winners.Count == 1)
        {
            roundEndMessage = $"🎉 Round {match.RoundNumber} ended! {winners[0].Name} wins!";
        }
        else if (winners.Count > 1)
        {
            var winnerNames = string.Join(", ", winners.Select(w => w.Name));
            roundEndMessage = $"🎉 Round {match.RoundNumber} ended! Winners: {winnerNames}";
        }
        else
        {
            roundEndMessage = $"⭐ Round {match.RoundNumber} ended!";
        }

        // Add scoring details
        roundEndMessage += " Scoring: " + string.Join(", ", roundResults);

        // Store the round end message (will be broadcast by the calling method)
        match.LastRoundEndMessage = roundEndMessage;
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

        // REMOVED: No immediate round ending when players reach 0 cards
        // The round continues until explicitly ended by other conditions

        var state = CreateGameStateDto(match, playerId);
        state.LastAction = result;
        return state;
    }

    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null) return false;

        if (request.Action == ActionType.Play)
        {
            // Players with 0 cards cannot play
            if (player.Hand.Count == 0) return false;

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
            // Players with 0 cards CANNOT challenge
            if (player.Hand.Count == 0) return false;

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
