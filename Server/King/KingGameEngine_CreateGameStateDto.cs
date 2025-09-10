// Server/King/KingGameEngine_CreateGameStateDto.cs
namespace BelieveOrNot.Server.King;

public partial class KingGameEngine
{
    public KingGameStateDto CreateGameStateDto(KingMatch match)
    {
        return new KingGameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new KingPlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            CurrentPlayerIndex = match.CurrentPlayerIndex,
            CurrentRoundIndex = match.CurrentRoundIndex,
            CurrentRound = match.CurrentRound,
            CompletedTricks = match.CompletedTricks,
            CurrentTrick = match.CurrentTrick,
            WaitingForTrumpSelection = match.WaitingForTrumpSelection,
            SelectedTrumpSuit = match.SelectedTrumpSuit
        };
    }
}