// MessageFormatter.cs
// Server-side message formatting that generates HTML directly

namespace BelieveOrNot.Server;

public static class MessageFormatter
{
    public static string FormatPlayer(string playerName)
    {
        return $"<span style=\"font-weight: bold; font-style: italic;\">{playerName}</span>";
    }

    public static string FormatRank(string rank)
    {
        return $"<span style=\"font-weight: bold; font-size: 1.3em;\">{rank}</span>";
    }

    public static string FormatCard(Card card)
    {
        if (card.IsJoker)
        {
            return "<span style=\"font-size: 1.2em; font-weight: bold;\">🃏</span>";
        }
        return FormatCard(card.Rank, card.Suit);
    }

    public static string FormatCard(string rank, string suit)
    {
        if (rank == "Joker")
        {
            return "<span style=\"font-size: 1.2em; font-weight: bold;\">🃏</span>";
        }

        // Get suit symbol and color
        string suitSymbol;
        string color;

        switch (suit)
        {
            case "Hearts":
                suitSymbol = "♥";
                color = "#dc3545";
                break;
            case "Diamonds":
                suitSymbol = "♦";
                color = "#dc3545";
                break;
            case "Clubs":
                suitSymbol = "♣";
                color = "#333";
                break;
            case "Spades":
                suitSymbol = "♠";
                color = "#333";
                break;
            default:
                suitSymbol = suit;
                color = "#333";
                break;
        }

        // Bold rank + space + suit symbol
        return $"<span style=\"color: {color}; font-weight: bold; font-size: 1.3em;\">{rank}</span> <span style=\"color: {color}; font-size: 1.1em;\">{suitSymbol}</span>";
    }

    public static string FormatCount(int count)
    {
        return $"<span style=\"font-weight: bold;\">{count}</span>";
    }

    public static string FormatPoints(int points)
    {
        var sign = points > 0 ? "+" : "";
        var color = points > 0 ? "#28a745" : points < 0 ? "#dc3545" : "#333";
        return $"<span style=\"font-weight: bold; color: {color};\">{sign}{points}</span>";
    }

    // Helper methods for common message patterns
    public static string PlayerAction(string playerName, string action)
    {
        return $"{FormatPlayer(playerName)} {action}";
    }

    public static string CardPlay(string playerName, int cardCount, string rank)
    {
        return $"{FormatPlayer(playerName)} played {FormatCount(cardCount)} card(s) claiming {FormatRank(rank)}.";
    }

    public static string Challenge(string challenger, string challenged, int cardIndex, int totalCards)
    {
        return $"{FormatPlayer(challenger)} challenges {FormatPlayer(challenged)} (card {FormatCount(cardIndex + 1)} of {FormatCount(totalCards)}).";
    }

    public static string ChallengeResult(Card revealedCard, string announcedRank, string challenger, string challenged, bool cardMatches)
    {
        var cardText = FormatCard(revealedCard);
        var rankText = FormatRank(announcedRank);

        if (cardMatches)
        {
            // Card matches the announced rank - challenger was WRONG
            var matchText = revealedCard.IsJoker ?
                $"(Joker matches {rankText})" :
                $"(matches {rankText})";
            return $"Challenged card was {cardText} {matchText}. {FormatPlayer(challenger)} was wrong and collects all cards.";
        }
        else
        {
            // Card does NOT match - challenger was RIGHT
            return $"Challenged card was {cardText} (does not match {rankText}). {FormatPlayer(challenger)} was right, {FormatPlayer(challenged)} collects all cards.";
        }
    }

    public static string Disposal(string playerName, string rank)
    {
        return $"{FormatPlayer(playerName)} disposed 4 of a kind: {FormatRank(rank)}s.";
    }

    public static string RoundEnd(int roundNumber, List<string> winnerNames)
    {
        if (winnerNames.Count == 1)
        {
            return $"🏁 Round {FormatCount(roundNumber)} ended! {FormatPlayer(winnerNames[0])} wins!";
        }
        else if (winnerNames.Count > 1)
        {
            var formattedWinners = string.Join(", ", winnerNames.Select(FormatPlayer));
            return $"🏁 Round {FormatCount(roundNumber)} ended! Winners: {formattedWinners}";
        }
        else
        {
            return $"🏁 Round {FormatCount(roundNumber)} ended!";
        }
    }

    public static string ScoreResult(string playerName, int points, bool isWinner, int bonusPoints, int regularCards, int jokerCards, int regularPenalty, int jokerPenalty)
    {
        if (isWinner)
        {
            return $"{FormatPlayer(playerName)}: {FormatPoints(points)} points (Winner bonus: {FormatPoints(bonusPoints)}, {FormatCount(0)} cards)";
        }
        else
        {
            var penalties = new List<string>();
            if (regularCards > 0)
            {
                penalties.Add($"{FormatCount(regularCards)} cards: {FormatPoints(regularPenalty)}");
            }
            if (jokerCards > 0)
            {
                penalties.Add($"{FormatCount(jokerCards)} jokers: {FormatPoints(jokerPenalty)}");
            }
            return $"{FormatPlayer(playerName)}: {FormatPoints(points)} points ({string.Join(", ", penalties)})";
        }
    }

    public static string ConnectionEvent(string playerName, bool connected)
    {
        var icon = connected ? "🔄" : "⚠️";
        var action = connected ? "reconnected to" : "disconnected from";
        return $"{icon} {FormatPlayer(playerName)} {action} the game!";
    }

    public static string JoinEvent(string playerName, bool created)
    {
        var icon = created ? "🎮" : "👋";
        var action = created ? "created" : "joined";
        return $"{icon} {FormatPlayer(playerName)} {action} the game!";
    }

    public static string GameEnd(string playerName, List<string> winnerNames, int winnerScore)
    {
        string winnerText;
        if (winnerNames.Count == 1)
        {
            winnerText = $"🏆 {FormatPlayer(winnerNames[0])} wins with {FormatPoints(winnerScore)} points!";
        }
        else
        {
            var formattedWinners = string.Join(", ", winnerNames.Select(FormatPlayer));
            winnerText = $"🏆 Tie game! Winners: {formattedWinners} with {FormatPoints(winnerScore)} points each!";
        }

        return $"🎯 {FormatPlayer(playerName)} ended the game. {winnerText}";
    }
}
