// KingViewRenderer.cs
using System.Text;
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.King;

namespace BelieveOrNot.Server.Services;

public interface IKingViewRenderer
{
    Task<string> RenderAllRegionsAsync(KingMatch match, Guid playerId);
    Task<string> RenderStateUpdateAsync(KingMatch match, Guid playerId);
    Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent);
    Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText);
}

public class KingViewRenderer : IKingViewRenderer
{
    private readonly IRazorPartialRenderer _renderer;
    private readonly IKingGameEngine _gameEngine;
    private readonly ILogger<KingViewRenderer> _logger;

    private static readonly string[] AllPartials =
    [
        "/Pages/King/Partials/_SseContainer.cshtml",
        "/Pages/King/Partials/_ConnectionStatus.cshtml",
        "/Pages/King/Partials/_SetupForm.cshtml",
        "/Pages/King/Partials/_GameStatus.cshtml",
        "/Pages/King/Partials/_Players.cshtml",
        "/Pages/King/Partials/_TrumpDisplay.cshtml",
        "/Pages/King/Partials/_Trick.cshtml",
        "/Pages/King/Partials/_Hand.cshtml",
        "/Pages/King/Partials/_Actions.cshtml",
        "/Pages/King/Partials/_TrumpSelect.cshtml",
        "/Pages/King/Partials/_RoundInfo.cshtml",
        "/Pages/King/Partials/_Scores.cshtml",
        "/Pages/King/Partials/_EventLog.cshtml",
        "/Pages/King/Partials/_Management.cshtml",
        "/Pages/King/Partials/_ManagementControls.cshtml",
        "/Pages/King/Partials/_FinalResults.cshtml",
    ];

    // State updates exclude _SseContainer (avoid replacing live SSE connection)
    // and _EventLog (entries are delivered individually via afterbegin OOB swaps).
    private static readonly string[] StateUpdatePartials =
        AllPartials.Where(p => !p.Contains("_SseContainer") && !p.Contains("_EventLog")).ToArray();

    public KingViewRenderer(IRazorPartialRenderer renderer, IKingGameEngine gameEngine, ILogger<KingViewRenderer> logger)
    {
        _renderer = renderer;
        _gameEngine = gameEngine;
        _logger = logger;
    }

    public async Task<string> RenderAllRegionsAsync(KingMatch match, Guid playerId)
    {
        return await RenderPartialsAsync(AllPartials, match, playerId);
    }

    public async Task<string> RenderStateUpdateAsync(KingMatch match, Guid playerId)
    {
        return await RenderPartialsAsync(StateUpdatePartials, match, playerId);
    }

    private async Task<string> RenderPartialsAsync(string[] partials, KingMatch match, Guid playerId)
    {
        var viewModel = BuildViewModel(match, playerId);
        var sb = new StringBuilder();

        foreach (var partialPath in partials)
        {
            try
            {
                var html = await _renderer.RenderPartialAsync(partialPath, viewModel);
                sb.AppendLine(html);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to render partial {Partial}, using fallback", partialPath);
                sb.AppendLine($"<!-- render-error: {partialPath} -->");
            }
        }

        return sb.ToString();
    }

    public Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent)
    {
        var iso = gameEvent.Timestamp.ToString("o");
        var html = $"<div hx-swap-oob=\"afterbegin:#king-event-log\">" +
                   $"<div class=\"event-entry\"><time class=\"event-time\" datetime=\"{iso}\">{gameEvent.Timestamp:HH:mm:ss}</time> {gameEvent.DisplayMessage}</div>" +
                   $"</div>";
        return Task.FromResult(html);
    }

    public Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText)
    {
        var sb = new StringBuilder();
        sb.Append("<div id=\"king-final-results\" hx-swap-oob=\"true\">");
        sb.Append("<div class=\"final-results-overlay\"><div class=\"final-results-content\">");
        sb.Append($"<h2>{winnerText}</h2>");
        sb.Append("<table class=\"score-table\"><thead><tr><th>#</th><th>Player</th><th>Score</th></tr></thead><tbody>");
        foreach (var score in finalScores)
        {
            sb.Append($"<tr><td colspan=\"3\">{score}</td></tr>");
        }
        sb.Append("</tbody></table>");
        sb.Append("</div></div></div>");
        return Task.FromResult(sb.ToString());
    }

    private KingViewModel BuildViewModel(KingMatch match, Guid playerId)
    {
        var state = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);

        return new KingViewModel
        {
            State = state,
            YourPlayerId = playerId,
        };
    }
}
