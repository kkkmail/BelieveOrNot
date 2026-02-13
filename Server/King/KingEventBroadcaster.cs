// Server/King/KingEventBroadcaster.cs
using BelieveOrNot.Server.BelieveOrNot;
using BelieveOrNot.Server.Sse;

// ReSharper disable RedundantAnonymousTypePropertyName

namespace BelieveOrNot.Server.King;

public class KingEventBroadcaster : IKingEventBroadcaster
{
    private readonly IHubContext<KingHub> _hubContext;
    private readonly ISseBroadcaster _sseBroadcaster;

    public KingEventBroadcaster(IHubContext<KingHub> hubContext, ISseBroadcaster sseBroadcaster)
    {
        _hubContext = hubContext;
        _sseBroadcaster = sseBroadcaster;
    }

    public async Task BroadcastCardPlayed(KingMatch match, CardPlayedEvent eventData)
    {
        var cardPlayedEvent = new GameEventDto
        {
            Type = "CardPlayed",
            DisplayMessage = $"🃏 {MessageFormatter.FormatPlayer(eventData.PlayerName)} played {MessageFormatter.FormatCard(eventData.Card)}",
            Data = new {
                PlayerName = eventData.PlayerName,
                Card = eventData.Card
            }
        };

        await BroadcastToMatch(match.Id, cardPlayedEvent);
    }

    public async Task BroadcastTrumpSelected(KingMatch match, TrumpSelectedEvent eventData)
    {
        var trumpSelectedEvent = new GameEventDto
        {
            Type = "TrumpSelected",
            DisplayMessage = $"👑 {MessageFormatter.FormatPlayer(eventData.PlayerName)} selected {MessageFormatter.FormatSuit(eventData.TrumpSuit)} {eventData.TrumpSuit} as trump suit",
            Data = new {
                PlayerName = eventData.PlayerName,
                TrumpSuit = eventData.TrumpSuit
            }
        };

        await BroadcastToMatch(match.Id, trumpSelectedEvent);
    }

    public async Task BroadcastTrickWon(KingMatch match, TrickWonEvent eventData)
    {
        var trickCardsText = string.Join(", ", eventData.TrickCards.Select(pc => MessageFormatter.FormatCard(pc.Card)));
        var trickWonEvent = new GameEventDto
        {
            Type = "TrickWon",
            DisplayMessage = $"🏆 {MessageFormatter.FormatPlayer(eventData.WinnerName)} won trick #{eventData.TrickNumber} with {MessageFormatter.FormatCard(eventData.WinningCard)} (Trick: {trickCardsText})",
            Data = new {
                WinnerName = eventData.WinnerName,
                WinningCard = eventData.WinningCard,
                TrickNumber = eventData.TrickNumber
            }
        };

        await BroadcastToMatch(match.Id, trickWonEvent);
    }

    public async Task BroadcastRoundEnded(KingMatch match, RoundEndedEvent eventData)
    {
        // Create detailed scoring information
        var playerScoreDetails = new List<object>();
        foreach (var player in match.Players)
        {
            var roundScore = eventData.RoundScores[player.Id];
            var tricksWon = match.CompletedTricks.Count(t => t.WinnerId == player.Id);

            playerScoreDetails.Add(new
            {
                PlayerName = player.Name,
                RoundScore = roundScore,
                TricksWon = tricksWon
            });
        }

        var roundEndedEvent = new GameEventDto
        {
            Type = "RoundEnded",
            DisplayMessage = CreateRoundEndMessage(eventData.Round, playerScoreDetails, eventData.EndReason, eventData.WasEarlyTermination, eventData.TricksCompleted),
            Data = new
            {
                RoundName = eventData.Round.Name,
                RoundNumber = match.CurrentRoundIndex,
                RoundType = eventData.Round.RoundType.ToString(),
                IsCollectingPhase = eventData.Round.IsCollectingPhase,
                TricksCompleted = eventData.TricksCompleted,
                TotalTricks = 8,
                WasEarlyTermination = eventData.WasEarlyTermination,
                EndReason = eventData.EndReason,
                TrumpSuit = match.SelectedTrumpSuit?.ToString(),
                PlayerScores = playerScoreDetails
            }
        };

        await BroadcastToMatch(match.Id, roundEndedEvent);
    }

    private async Task BroadcastToMatch(Guid matchId, GameEventDto gameEvent)
    {
        // SignalR (old UI)
        await _hubContext.Clients.Group($"kingmatch:{matchId}").SendAsync("GameEvent", gameEvent);

        // SSE (new htmx UI) — render event log entry HTML inline
        var iso = gameEvent.Timestamp.ToString("o");
        var html = $"<div hx-swap-oob=\"afterbegin:#king-event-log\">" +
                   $"<div class=\"event-entry\"><time class=\"event-time\" datetime=\"{iso}\">{gameEvent.Timestamp:HH:mm:ss}</time> {gameEvent.DisplayMessage}</div>" +
                   $"</div>";
        await _sseBroadcaster.SendToMatchAsync(matchId, "game-event", _ => html);
    }

    private string CreateRoundEndMessage(GameRound round, List<object> playerScores, string endReason, bool wasEarlyTermination, int tricksCompleted)
    {
        var phaseText = round.IsCollectingPhase ? "Collecting" : "Avoiding";
        var terminationText = wasEarlyTermination ? $" (Early end: {endReason})" : "";

        var message = $"🏁 Round completed: <strong>{round.Name}</strong> ({phaseText} Phase){terminationText}<br>";
        message += $"📊 Tricks played: {tricksCompleted}/8<br><br>";

        message += "<strong>Round Scoring:</strong><br>";
        foreach (dynamic playerScore in playerScores)
        {
            var scoreChange = (int)playerScore.RoundScore;
            var playerName = MessageFormatter.FormatPlayer((string)playerScore.PlayerName);
            var tricksWon = (int)playerScore.TricksWon;
            var scoreText = MessageFormatter.FormatPoints(scoreChange);

            message += $"{playerName}: {scoreText} points ({tricksWon} tricks)<br>";
        }

        return message;
    }
}
