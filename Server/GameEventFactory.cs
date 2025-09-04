// Server/GameEventFactory.cs
namespace BelieveOrNot.Server;

public static class GameEventFactory
{
    public static GameEventDto CreateChallengeEvent(string challenger, string challenged, int cardIndex, int totalCards, Card revealedCard, string announcedRank, bool cardMatches, string collector, int cardsCollected, List<Card> allTableCards)
    {
        // Get remaining cards (excluding the revealed one) for challenger animation
        List<Card>? remainingCards = null;
        if (cardMatches && collector == challenger) // Challenger collects when card matches
        {
            remainingCards = allTableCards
                .Skip(allTableCards.Count - totalCards) // Get last play cards
                .Where((card, index) => index != cardIndex) // Exclude revealed card
                .ToList();
        }

        var data = new ChallengeEventData
        {
            ChallengerName = challenger,
            ChallengedPlayerName = challenged,
            CardIndex = cardIndex,
            TotalCards = totalCards,
            RevealedCard = revealedCard,
            AnnouncedRank = announcedRank,
            IsMatch = cardMatches,
            CollectorName = collector,
            CardsCollected = cardsCollected,
            RemainingCards = remainingCards
        };

        // Create the display message with correct logic
        var challengeDetails = MessageFormatter.Challenge(challenger, challenged, cardIndex, totalCards);
        var challengeResult = MessageFormatter.ChallengeResult(revealedCard, announcedRank, challenger, challenged, cardMatches);
        var displayMessage = challengeDetails + " " + challengeResult;

        Console.WriteLine($"DEBUG Challenge Event - CardIndex: {cardIndex}, TotalCards: {totalCards}, AnnouncedRank: '{announcedRank}', CardMatches: {cardMatches}, Collector: {collector}");

        return new GameEventDto
        {
            Type = "Challenge",
            DisplayMessage = displayMessage,
            Data = data
        };
    }

    public static GameEventDto CreateCardPlayEvent(string playerName, List<Card> cards, string declaredRank, int remainingCards)
    {
        var data = new CardPlayEventData
        {
            PlayerName = playerName,
            CardsPlayed = cards,
            DeclaredRank = declaredRank,
            RemainingCards = remainingCards,
            HasNoCardsLeft = remainingCards == 0
        };

        var displayMessage = MessageFormatter.CardPlay(playerName, cards.Count, declaredRank);
        if (remainingCards == 0)
        {
            displayMessage += $" and has {MessageFormatter.FormatCount(0)} CARDS LEFT! Game continues.";
        }

        return new GameEventDto
        {
            Type = "CardPlay",
            DisplayMessage = displayMessage,
            Data = data
        };
    }

    public static GameEventDto CreateRoundStartEvent(int roundNumber, List<string> disposalMessages)
    {
        var displayMessage = $"🎯 Round {MessageFormatter.FormatCount(roundNumber)} started!";
        if (disposalMessages.Any())
        {
            displayMessage += " " + string.Join(" ", disposalMessages);
        }

        return new GameEventDto
        {
            Type = "RoundStart",
            DisplayMessage = displayMessage,
            Data = new { RoundNumber = roundNumber, Disposals = disposalMessages }
        };
    }

    public static GameEventDto CreateRoundEndEvent(int roundNumber, List<string> winnerNames, List<PlayerScoreResult> scoreResults)
    {
        var data = new RoundEndEventData
        {
            RoundNumber = roundNumber,
            WinnerNames = winnerNames,
            ScoreResults = scoreResults
        };

        var displayMessage = MessageFormatter.RoundEnd(roundNumber, winnerNames);
        var scoreMessages = scoreResults.Select(r =>
            MessageFormatter.ScoreResult(r.PlayerName, r.ScoreChange, r.IsWinner, r.WinnerBonus, r.RegularCards, r.JokerCards, r.ScoreChange - r.WinnerBonus, r.JokerCards * -3));
        displayMessage += " Scoring: " + string.Join(", ", scoreMessages);

        return new GameEventDto
        {
            Type = "RoundEnd",
            DisplayMessage = displayMessage,
            Data = data
        };
    }

    public static GameEventDto CreateDisposalEvent(string playerName, string rank)
    {
        var data = new DisposalEventData
        {
            PlayerName = playerName,
            Rank = rank
        };

        return new GameEventDto
        {
            Type = "Disposal",
            DisplayMessage = MessageFormatter.Disposal(playerName, rank),
            Data = data
        };
    }

    public static GameEventDto CreateConnectionEvent(string playerName, bool connected)
    {
        var data = new ConnectionEventData
        {
            PlayerName = playerName,
            IsConnected = connected
        };

        return new GameEventDto
        {
            Type = "Connection",
            DisplayMessage = MessageFormatter.ConnectionEvent(playerName, connected),
            Data = data
        };
    }

    public static GameEventDto CreateJoinEvent(string playerName, bool isCreator)
    {
        var data = new JoinEventData
        {
            PlayerName = playerName,
            IsCreator = isCreator
        };

        return new GameEventDto
        {
            Type = "Join",
            DisplayMessage = MessageFormatter.JoinEvent(playerName, isCreator),
            Data = data
        };
    }

    public static GameEventDto CreateGameEndEvent(string initiatorName, List<string> winnerNames, int winnerScore, List<PlayerFinalScore> finalScores)
    {
        var data = new GameEndEventData
        {
            InitiatorName = initiatorName,
            WinnerNames = winnerNames,
            WinnerScore = winnerScore,
            FinalScores = finalScores
        };

        return new GameEventDto
        {
            Type = "GameEnd",
            DisplayMessage = MessageFormatter.GameEnd(initiatorName, winnerNames, winnerScore),
            Data = data
        };
    }
}
