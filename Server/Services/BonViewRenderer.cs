// BonViewRenderer.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.Shared;

namespace BelieveOrNot.Server.Services;

public interface IBonViewRenderer
{
    Task<string> RenderAllRegionsAsync(Match match, Guid playerId);
    Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent);
    Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText);
}

public class BonViewRenderer : IBonViewRenderer
{
    private readonly IRazorPartialRenderer _renderer;
    private readonly IGameEngine _gameEngine;

    public BonViewRenderer(IRazorPartialRenderer renderer, IGameEngine gameEngine)
    {
        _renderer = renderer;
        _gameEngine = gameEngine;
    }

    public Task<string> RenderAllRegionsAsync(Match match, Guid playerId)
    {
        var state = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
        state.CreatorPlayerId = match.Players[0].Id;
        state.DeckSize = (int)match.Settings.DeckSize;
        state.JokerCount = match.Settings.JokerCount;

        // TODO: Phase 3 — render actual Razor partials here.
        // For now, return a placeholder indicating which regions would be updated.
        var html = $"<!-- state-update for player {playerId} -->\n" +
                   $"<!-- phase={state.Phase}, round={state.RoundNumber}, " +
                   $"players={state.Players?.Count ?? 0}, " +
                   $"hand={state.YourHand?.Count ?? 0} cards -->";
        return Task.FromResult(html);
    }

    public Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent)
    {
        // TODO: Phase 3 — render _EventLog partial
        var html = $"<!-- game-event: {gameEvent.Type} - {gameEvent.DisplayMessage} -->";
        return Task.FromResult(html);
    }

    public Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText)
    {
        // TODO: Phase 3 — render _FinalResults partial
        var html = $"<!-- game-ended: {winnerText} -->";
        return Task.FromResult(html);
    }
}
