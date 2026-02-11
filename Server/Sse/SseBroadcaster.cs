// SseBroadcaster.cs
using System.Text;

namespace BelieveOrNot.Server.Sse;

public interface ISseBroadcaster
{
    Task SendToPlayerAsync(Guid playerId, string eventName, string htmlFragment);
    Task SendToMatchAsync(Guid matchId, string eventName, Func<Guid, string> htmlFragmentPerPlayer);
    Task SendToOthersInMatchAsync(Guid matchId, Guid excludePlayerId, string eventName, Func<Guid, string> htmlFragmentPerPlayer);
}

public class SseBroadcaster : ISseBroadcaster
{
    private readonly ISseConnectionManager _connectionManager;
    private readonly ILogger<SseBroadcaster> _logger;

    public SseBroadcaster(ISseConnectionManager connectionManager, ILogger<SseBroadcaster> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public async Task SendToPlayerAsync(Guid playerId, string eventName, string htmlFragment)
    {
        var connection = _connectionManager.GetConnection(playerId);
        if (connection == null) return;

        await WriteSseEventAsync(connection, eventName, htmlFragment);
    }

    public async Task SendToMatchAsync(Guid matchId, string eventName, Func<Guid, string> htmlFragmentPerPlayer)
    {
        var connections = _connectionManager.GetConnectionsForMatch(matchId).ToList();

        foreach (var connection in connections)
        {
            var html = htmlFragmentPerPlayer(connection.PlayerId);
            await WriteSseEventAsync(connection, eventName, html);
        }
    }

    public async Task SendToOthersInMatchAsync(Guid matchId, Guid excludePlayerId, string eventName, Func<Guid, string> htmlFragmentPerPlayer)
    {
        var connections = _connectionManager.GetOtherConnectionsForMatch(matchId, excludePlayerId).ToList();

        foreach (var connection in connections)
        {
            var html = htmlFragmentPerPlayer(connection.PlayerId);
            await WriteSseEventAsync(connection, eventName, html);
        }
    }

    private async Task WriteSseEventAsync(SseConnection connection, string eventName, string htmlFragment)
    {
        try
        {
            if (connection.Cts.IsCancellationRequested) return;

            // SSE spec requires \n line endings only. On Windows, StringBuilder.AppendLine()
            // produces \r\n, and Razor output also uses \r\n. The SSE parser treats \r as a
            // line terminator, so \r\r\n would create a spurious empty line that prematurely
            // dispatches the event. We must use \n exclusively.
            var sb = new StringBuilder();
            sb.Append("event: ").Append(eventName).Append('\n');

            // Normalize HTML to \n-only, then prefix each line with "data: "
            var normalized = htmlFragment.ReplaceLineEndings("\n");
            foreach (var line in normalized.Split('\n'))
            {
                sb.Append("data: ").Append(line).Append('\n');
            }

            sb.Append('\n'); // Empty line terminates the event

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            await connection.Response.Body.WriteAsync(bytes, connection.Cts.Token);
            await connection.Response.Body.FlushAsync(connection.Cts.Token);
        }
        catch (OperationCanceledException)
        {
            // Connection was closed, clean up
            _connectionManager.RemoveConnection(connection.PlayerId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SSE event to player {PlayerId}", connection.PlayerId);
            _connectionManager.RemoveConnection(connection.PlayerId);
        }
    }
}
