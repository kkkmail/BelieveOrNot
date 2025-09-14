// Server/King/IKingEventBroadcaster.cs
namespace BelieveOrNot.Server.King;

public interface IKingEventBroadcaster
{
    Task BroadcastCardPlayed(KingMatch match, CardPlayedEvent eventData);
    Task BroadcastTrumpSelected(KingMatch match, TrumpSelectedEvent eventData);
    Task BroadcastTrickWon(KingMatch match, TrickWonEvent eventData);
    Task BroadcastRoundEnded(KingMatch match, RoundEndedEvent eventData);
}
