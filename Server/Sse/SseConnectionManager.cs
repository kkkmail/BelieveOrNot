// SseConnectionManager.cs
namespace BelieveOrNot.Server.Sse;

public class SseConnection
{
    public Guid PlayerId { get; init; }
    public Guid MatchId { get; init; }
    public HttpResponse Response { get; init; } = null!;
    public CancellationTokenSource Cts { get; init; } = new();
}

public interface ISseConnectionManager
{
    void AddConnection(Guid playerId, Guid matchId, HttpResponse response, CancellationTokenSource cts);
    void RemoveConnection(Guid playerId);
    SseConnection? GetConnection(Guid playerId);
    IEnumerable<SseConnection> GetConnectionsForMatch(Guid matchId);
    IEnumerable<SseConnection> GetOtherConnectionsForMatch(Guid matchId, Guid excludePlayerId);
}

public class SseConnectionManager : ISseConnectionManager
{
    private readonly ConcurrentDictionary<Guid, SseConnection> _connections = new();

    public void AddConnection(Guid playerId, Guid matchId, HttpResponse response, CancellationTokenSource cts)
    {
        var connection = new SseConnection
        {
            PlayerId = playerId,
            MatchId = matchId,
            Response = response,
            Cts = cts
        };

        // If player already has a connection (e.g. reopened tab), cancel the old one
        if (_connections.TryGetValue(playerId, out var existing))
        {
            existing.Cts.Cancel();
        }

        _connections[playerId] = connection;
    }

    public void RemoveConnection(Guid playerId)
    {
        _connections.TryRemove(playerId, out _);
    }

    public SseConnection? GetConnection(Guid playerId)
    {
        _connections.TryGetValue(playerId, out var connection);
        return connection;
    }

    public IEnumerable<SseConnection> GetConnectionsForMatch(Guid matchId)
    {
        return _connections.Values.Where(c => c.MatchId == matchId);
    }

    public IEnumerable<SseConnection> GetOtherConnectionsForMatch(Guid matchId, Guid excludePlayerId)
    {
        return _connections.Values.Where(c => c.MatchId == matchId && c.PlayerId != excludePlayerId);
    }
}
