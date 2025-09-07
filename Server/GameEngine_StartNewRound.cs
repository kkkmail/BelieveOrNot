// GameEngine_StartNewRound.cs
namespace BelieveOrNot.Server;

public partial class GameEngine
{
    public GameStateDto StartNewRound(Match match)
    {
        if (match.Players.Count < 2)
        {
            throw new InvalidOperationException("Need at least 2 players to start a round");
        }

        _matchManager.ShufflePlayersForNewRound(match);

        var deck = DeckBuilder.BuildDeck(match.Settings.DeckSize, match.Settings.JokerCount);
        DeckBuilder.Shuffle(deck, _random);

        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        match.DisposedRanks.Clear(); // Reset disposed ranks for new round

        int playerCount = match.Players.Count;
        for (int cardIndex = 0; cardIndex < deck.Count; cardIndex++)
        {
            var playerIndex = cardIndex % playerCount;
            match.Players[playerIndex].Hand.Add(deck[cardIndex]);
        }

        var disposalMessages = new List<string>();
        foreach (var player in match.Players)
        {
            var disposedRanks = AutoDisposeFourOfAKind(player, match);
            foreach (var rank in disposedRanks)
            {
                var disposalEvent = GameEventFactory.CreateDisposalEvent(player.Name, rank);
                disposalMessages.Add(disposalEvent.DisplayMessage);
            }
        }

        match.CurrentPlayerIndex = (match.DealerIndex + 1) % match.Players.Count;
        match.Phase = GamePhase.InProgress;
        match.RoundNumber++;

        var state = CreateGameStateDto(match, Guid.Empty);
        state.Event = GameEventFactory.CreateRoundStartEvent(match.RoundNumber, disposalMessages);
        return state;
    }
}
