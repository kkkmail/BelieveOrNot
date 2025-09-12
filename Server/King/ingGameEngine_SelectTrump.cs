// Server/King/KingGameEngine_SelectTrump.cs

namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto SelectTrump(KingMatch match, Guid playerId, Suit trumpSuit)
    {
        Console.WriteLine("=== SELECT TRUMP METHOD CALLED ===");
        Console.WriteLine($"Match ID: {match.Id}");
        Console.WriteLine($"Player ID: {playerId}");
        Console.WriteLine($"Trump Suit: {trumpSuit}");
        Console.WriteLine($"Waiting for trump selection: {match.WaitingForTrumpSelection}");
        Console.WriteLine($"Current player index: {match.CurrentPlayerIndex}");
        Console.WriteLine($"Current round: {match.CurrentRound?.Name}");

        var player = match.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            Console.WriteLine($"ERROR: Player not found with ID: {playerId}");
            Console.WriteLine(
                $"Available players: {string.Join(", ", match.Players.Select(p => $"{p.Name}({p.Id})"))}");
            throw new InvalidOperationException("Player not found");
        }

        Console.WriteLine($"Player found: {player.Name} (ID: {player.Id})");
        Console.WriteLine($"Player TrumpSelectionCards count: {player.TrumpSelectionCards?.Count ?? 0}");
        if (player.TrumpSelectionCards != null)
        {
            Console.WriteLine(
                $"TrumSelectionCards: {string.Join(", ", player.TrumpSelectionCards.Select(c => $"{c.Rank} of {c.Suit}"))}");
        }

        Console.WriteLine($"Calling KingMoveValidator.IsValidTrumpSelection...");
        var isValid = KingMoveValidator.IsValidTrumpSelection(match, player, trumpSuit);
        Console.WriteLine($"Trump selection validation result: {isValid}");

        if (!isValid)
        {
            Console.WriteLine("ERROR: Invalid trump selection");
            Console.WriteLine($"Match phase: {match.Phase}");
            Console.WriteLine($"Current round name: {match.CurrentRound?.Name}");
            Console.WriteLine($"Is collecting phase: {match.CurrentRound?.IsCollectingPhase}");
            // Console.WriteLine($"Trump chooser: {match.CurrentRound?.TrumpChooser}");
            Console.WriteLine($"Current player: {match.Players[match.CurrentPlayerIndex].Id}");
            throw new InvalidOperationException("Invalid trump selection");
        }

        Console.WriteLine($"Setting trump suit to: {trumpSuit}");
        match.SelectedTrumpSuit = trumpSuit;
        match.CurrentRound!.TrumpSuit = trumpSuit;
        match.WaitingForTrumpSelection = false;

        Console.WriteLine($"Trump suit set successfully. Starting first trick...");

        // Start first trick
        StartNewTrick(match);

        Console.WriteLine($"First trick started. Creating game state DTO...");
        var result = CreateGameStateDto(match);

        Console.WriteLine($"Game state DTO created. Returning result.");
        Console.WriteLine("=== SELECT TRUMP METHOD COMPLETED ===");

        return result;
    }
}
