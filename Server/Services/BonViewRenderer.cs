// BonViewRenderer.cs
using System.Text;
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.Shared;

namespace BelieveOrNot.Server.Services;

public interface IBonViewRenderer
{
    Task<string> RenderAllRegionsAsync(Match match, Guid playerId);
    Task<string> RenderStateUpdateAsync(Match match, Guid playerId);
    Task<string> RenderEventLogEntryAsync(GameEventDto gameEvent);
    Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText);
}

public class BonViewRenderer : IBonViewRenderer
{
    private readonly IRazorPartialRenderer _renderer;
    private readonly IGameEngine _gameEngine;
    private readonly ILogger<BonViewRenderer> _logger;

    private static readonly string[] AllPartials =
    [
        "/Pages/Bon/Partials/_SseContainer.cshtml",
        "/Pages/Bon/Partials/_ConnectionStatus.cshtml",
        "/Pages/Bon/Partials/_SetupForm.cshtml",
        "/Pages/Bon/Partials/_GameStatus.cshtml",
        "/Pages/Bon/Partials/_Players.cshtml",
        "/Pages/Bon/Partials/_Hand.cshtml",
        "/Pages/Bon/Partials/_PreviousPlay.cshtml",
        "/Pages/Bon/Partials/_CardPile.cshtml",
        "/Pages/Bon/Partials/_Actions.cshtml",
        "/Pages/Bon/Partials/_Scores.cshtml",
        "/Pages/Bon/Partials/_EventLog.cshtml",
        "/Pages/Bon/Partials/_GameManagement.cshtml",
        "/Pages/Bon/Partials/_FinalResults.cshtml",
        "/Pages/Bon/Partials/_Help.cshtml",
    ];

    // State updates exclude _SseContainer to avoid replacing the live SSE connection
    private static readonly string[] StateUpdatePartials =
        AllPartials.Where(p => !p.Contains("_SseContainer")).ToArray();

    public BonViewRenderer(IRazorPartialRenderer renderer, IGameEngine gameEngine, ILogger<BonViewRenderer> logger)
    {
        _renderer = renderer;
        _gameEngine = gameEngine;
        _logger = logger;
    }

    public async Task<string> RenderAllRegionsAsync(Match match, Guid playerId)
    {
        return await RenderPartialsAsync(AllPartials, match, playerId);
    }

    public async Task<string> RenderStateUpdateAsync(Match match, Guid playerId)
    {
        return await RenderPartialsAsync(StateUpdatePartials, match, playerId);
    }

    private async Task<string> RenderPartialsAsync(string[] partials, Match match, Guid playerId)
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
        // Render a single event log entry that will be prepended to #event-log via OOB
        var html = $"<div hx-swap-oob=\"afterbegin:#event-log\">" +
                   $"<div class=\"event-entry\"><span class=\"event-time\">{gameEvent.Timestamp:HH:mm:ss}</span> {gameEvent.DisplayMessage}</div>" +
                   $"</div>";
        return Task.FromResult(html);
    }

    public Task<string> RenderFinalResultsAsync(List<string> winners, List<string> finalScores, string winnerText)
    {
        var sb = new StringBuilder();
        sb.Append("<div id=\"final-results\" hx-swap-oob=\"true\">");
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

    private BonViewModel BuildViewModel(Match match, Guid playerId)
    {
        var state = _gameEngine.CreateGameStateDtoForPlayer(match, playerId);
        state.CreatorPlayerId = match.Players[0].Id;
        state.DeckSize = (int)match.Settings.DeckSize;
        state.JokerCount = match.Settings.JokerCount;

        return new BonViewModel
        {
            State = state,
            YourPlayerId = playerId,
            MaxCardsPerPlay = match.Settings.MaxCardsPerPlay,
            MinCardsPerPlay = match.Settings.MinCardsPerPlay,
        };
    }
}
