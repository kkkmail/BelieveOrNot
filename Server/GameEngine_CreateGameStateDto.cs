// Server/GameEngine_CreateGameStateDto.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    private GameStateDto CreateGameStateDto(Match match, Guid requestingPlayerId)
    {
        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            TablePileCount = match.TablePile.Count,
            LastPlayCardCount = match.LastPlayCardCount,
            AnnouncedRank = match.AnnouncedRank,
            CurrentPlayerIndex = match.CurrentPlayerIndex,
            RoundNumber = match.RoundNumber,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList(),
            DeckSize = match.Settings.DeckSize,
            JokerCount = match.Settings.JokerCount,
            DisposedRanks = match.DisposedRanks.ToList(), // Include disposed ranks
            CreatorPlayerId = match.Players[0].Id
        };

        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            state.YourHand = requestingPlayer.Hand.Select(c => new Card(c.Rank, c.Suit)).ToList();
        }

        return state;
    }
}