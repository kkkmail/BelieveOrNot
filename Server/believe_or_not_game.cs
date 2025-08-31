// Program.cs - Main application entry point
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSignalR();
builder.Services.AddSingleton<IGameEngine, GameEngine>();
builder.Services.AddSingleton<IMatchManager, MatchManager>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapHub<GameHub>("/game");

app.Run();

// Models/Card.cs
public record Card(string Rank, string Suit)
{
    public bool IsJoker => Rank == "Joker";
    
    public override string ToString() => IsJoker ? "Joker" : $"{Rank} of {Suit}";
}

// Models/GameModels.cs
public class GameSettings
{
    public int DeckSize { get; set; } = 52;
    public int JokerCount { get; set; } = 0;
    public bool JokerDisposalEnabled { get; set; } = false;
    public int ScorePerCard { get; set; } = -1;
    public int ScorePerJoker { get; set; } = -3;
    public int WinnerBonus { get; set; } = 5;
    public int InviteTimeoutSeconds { get; set; } = 300;
}

public class Player
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<Card> Hand { get; set; } = new();
    public int Score { get; set; } = 0;
    public bool IsConnected { get; set; } = true;
}

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public GameSettings Settings { get; set; } = new();
    public List<Player> Players { get; set; } = new();
    public List<Card> TablePile { get; set; } = new();
    public string? AnnouncedRank { get; set; }
    public int CurrentPlayerIndex { get; set; } = 0;
    public int DealerIndex { get; set; } = 0;
    public int LastPlayCardCount { get; set; } = 0;
    public GamePhase Phase { get; set; } = GamePhase.WaitingForPlayers;
    public int RoundNumber { get; set; } = 0;
}

public enum GamePhase
{
    WaitingForPlayers,
    InProgress,
    RoundEnd,
    GameEnd
}

public enum ActionType
{
    Play,
    Challenge
}

// DTOs for client communication
public class CreateMatchRequest
{
    public string PlayerName { get; set; } = string.Empty;
    public GameSettings? Settings { get; set; }
}

public class SubmitMoveRequest
{
    public Guid MatchId { get; set; }
    public Guid ClientCmdId { get; set; }
    public ActionType Action { get; set; }
    public List<Card>? Cards { get; set; }
    public string? DeclaredRank { get; set; }
    public int? ChallengePickIndex { get; set; }
}

public class GameStateDto
{
    public Guid MatchId { get; set; }
    public GamePhase Phase { get; set; }
    public List<PlayerStateDto> Players { get; set; } = new();
    public int TablePileCount { get; set; }
    public string? AnnouncedRank { get; set; }
    public int CurrentPlayerIndex { get; set; }
    public int RoundNumber { get; set; }
    public string? LastAction { get; set; }
    public List<Card>? YourHand { get; set; }
}

public class PlayerStateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int HandCount { get; set; }
    public int Score { get; set; }
    public bool IsConnected { get; set; }
}

// Services/DeckBuilder.cs
public static class DeckBuilder
{
    private static readonly string[] Suits = { "Hearts", "Diamonds", "Clubs", "Spades" };
    
    public static List<Card> BuildDeck(int deckSize, int jokerCount)
    {
        var cards = new List<Card>();
        
        // Add regular cards based on deck size
        var ranks = deckSize switch
        {
            32 => new[] { "7", "8", "9", "10", "J", "Q", "K", "A" },
            36 => new[] { "6", "7", "8", "9", "10", "J", "Q", "K", "A" },
            52 => new[] { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" },
            _ => throw new ArgumentException($"Unsupported deck size: {deckSize}")
        };
        
        foreach (var suit in Suits)
        {
            foreach (var rank in ranks)
            {
                cards.Add(new Card(rank, suit));
            }
        }
        
        // Add jokers
        for (int i = 0; i < jokerCount; i++)
        {
            cards.Add(new Card("Joker", $"Joker{i + 1}"));
        }
        
        return cards;
    }
    
    public static void Shuffle(List<Card> deck, Random? random = null)
    {
        random ??= new Random();
        for (int i = deck.Count - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }
}

// Services/IGameEngine.cs
public interface IGameEngine
{
    GameStateDto StartNewRound(Match match);
    GameStateDto SubmitMove(Match match, Guid playerId, SubmitMoveRequest request);
    bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request);
}

// Services/GameEngine.cs
public class GameEngine : IGameEngine
{
    private readonly Random _random = new();
    
    public GameStateDto StartNewRound(Match match)
    {
        if (match.Players.Count < 2)
        {
            throw new InvalidOperationException("Need at least 2 players to start a round");
        }
        
        // Build and shuffle deck
        var deck = DeckBuilder.BuildDeck(match.Settings.DeckSize, match.Settings.JokerCount);
        DeckBuilder.Shuffle(deck, _random);
        
        // Clear hands and table
        foreach (var player in match.Players)
        {
            player.Hand.Clear();
        }
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        
        // Deal cards
        int playerIndex = 0;
        foreach (var card in deck)
        {
            match.Players[playerIndex].Hand.Add(card);
            playerIndex = (playerIndex + 1) % match.Players.Count;
        }
        
        // Auto-dispose four-of-a-kinds
        foreach (var player in match.Players)
        {
            AutoDisposeFourOfAKind(player);
        }
        
        // Set current player (left of dealer)
        match.CurrentPlayerIndex = (match.DealerIndex + 1) % match.Players.Count;
        match.Phase = GamePhase.InProgress;
        match.RoundNumber++;
        
        return CreateGameStateDto(match, Guid.Empty);
    }
    
    public GameStateDto SubmitMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (!IsValidMove(match, playerId, request))
        {
            throw new InvalidOperationException("Invalid move");
        }
        
        var player = match.Players.First(p => p.Id == playerId);
        var result = string.Empty;
        
        if (request.Action == ActionType.Play)
        {
            HandlePlayAction(match, player, request, out result);
        }
        else if (request.Action == ActionType.Challenge)
        {
            HandleChallengeAction(match, player, request, out result);
        }
        
        // Check for round end
        if (match.Players.Any(p => p.Hand.Count == 0))
        {
            EndRound(match);
            result += " Round ended!";
        }
        
        var state = CreateGameStateDto(match, playerId);
        state.LastAction = result;
        return state;
    }
    
    private void HandlePlayAction(Match match, Player player, SubmitMoveRequest request, out string result)
    {
        // Remove cards from player's hand
        foreach (var card in request.Cards!)
        {
            player.Hand.Remove(card);
        }
        
        // Add cards to table pile
        match.TablePile.AddRange(request.Cards!);
        match.LastPlayCardCount = request.Cards!.Count;
        
        // Set announced rank if opening turn
        if (match.AnnouncedRank == null)
        {
            match.AnnouncedRank = request.DeclaredRank;
        }
        
        // Auto-dispose four-of-a-kind after play
        AutoDisposeFourOfAKind(player);
        
        // Next player's turn
        match.CurrentPlayerIndex = (match.CurrentPlayerIndex + 1) % match.Players.Count;
        
        result = $"{player.Name} played {request.Cards!.Count} card(s) claiming {match.AnnouncedRank}";
    }
    
    private void HandleChallengeAction(Match match, Player challenger, SubmitMoveRequest request, out string result)
    {
        // Find the card to flip (from last play)
        var cardIndex = match.TablePile.Count - match.LastPlayCardCount + request.ChallengePickIndex!.Value;
        var flippedCard = match.TablePile[cardIndex];
        
        // Determine if challenge succeeded
        bool challengeHit = flippedCard.Rank == match.AnnouncedRank;
        
        // Determine who collects the pile
        Player collector;
        if (challengeHit)
        {
            // Challenger was wrong, they collect
            collector = challenger;
            result = $"{challenger.Name} challenged and was wrong! {flippedCard} matched {match.AnnouncedRank}";
        }
        else
        {
            // Previous player was lying, they collect
            var prevPlayerIndex = (match.CurrentPlayerIndex - 1 + match.Players.Count) % match.Players.Count;
            collector = match.Players[prevPlayerIndex];
            result = $"{challenger.Name} challenged and was right! {flippedCard} didn't match {match.AnnouncedRank}";
        }
        
        // Collector takes all cards
        collector.Hand.AddRange(match.TablePile);
        match.TablePile.Clear();
        match.AnnouncedRank = null;
        match.LastPlayCardCount = 0;
        
        // Auto-dispose four-of-a-kind after collection
        AutoDisposeFourOfAKind(collector);
        
        // Next turn goes to left of collector
        var collectorIndex = match.Players.IndexOf(collector);
        match.CurrentPlayerIndex = (collectorIndex + 1) % match.Players.Count;
        
        result += $" {collector.Name} collected {match.TablePile.Count} cards";
    }
    
    private void AutoDisposeFourOfAKind(Player player)
    {
        var groups = player.Hand.Where(c => !c.IsJoker)
            .GroupBy(c => c.Rank)
            .Where(g => g.Count() >= 4)
            .ToList();
        
        foreach (var group in groups)
        {
            var cardsToRemove = group.Take(4).ToList();
            foreach (var card in cardsToRemove)
            {
                player.Hand.Remove(card);
            }
        }
    }
    
    private void EndRound(Match match)
    {
        match.Phase = GamePhase.RoundEnd;
        
        // Calculate scores
        foreach (var player in match.Players)
        {
            var roundScore = 0;
            
            // Points for remaining cards
            foreach (var card in player.Hand)
            {
                if (card.IsJoker)
                    roundScore += match.Settings.ScorePerJoker;
                else
                    roundScore += match.Settings.ScorePerCard;
            }
            
            // Winner bonus
            if (player.Hand.Count == 0)
            {
                roundScore += match.Settings.WinnerBonus;
                match.DealerIndex = match.Players.IndexOf(player); // Winner becomes next dealer
            }
            
            player.Score += roundScore;
        }
    }
    
    public bool IsValidMove(Match match, Guid playerId, SubmitMoveRequest request)
    {
        if (match.Phase != GamePhase.InProgress) return false;
        
        var currentPlayer = match.Players[match.CurrentPlayerIndex];
        if (currentPlayer.Id != playerId) return false;
        
        var player = match.Players.First(p => p.Id == playerId);
        
        if (request.Action == ActionType.Play)
        {
            // Validate play action
            if (request.Cards == null || request.Cards.Count < 1 || request.Cards.Count > 3)
                return false;
            
            // Check player has these cards
            foreach (var card in request.Cards)
            {
                if (!player.Hand.Contains(card)) return false;
            }
            
            // Opening turn must declare rank
            if (match.AnnouncedRank == null)
            {
                return !string.IsNullOrEmpty(request.DeclaredRank);
            }
            
            return true;
        }
        else if (request.Action == ActionType.Challenge)
        {
            // Can only challenge if there's a table pile with announced rank
            if (match.TablePile.Count == 0 || match.AnnouncedRank == null)
                return false;
            
            // Must specify valid pick index within last play
            if (!request.ChallengePickIndex.HasValue)
                return false;
            
            var pickIndex = request.ChallengePickIndex.Value;
            return pickIndex >= 0 && pickIndex < match.LastPlayCardCount;
        }
        
        return false;
    }
    
    private GameStateDto CreateGameStateDto(Match match, Guid requestingPlayerId)
    {
        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            TablePileCount = match.TablePile.Count,
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
            }).ToList()
        };
        
        // Include requesting player's hand
        var requestingPlayer = match.Players.FirstOrDefault(p => p.Id == requestingPlayerId);
        if (requestingPlayer != null)
        {
            state.YourHand = new List<Card>(requestingPlayer.Hand);
        }
        
        return state;
    }
}

// Services/IMatchManager.cs
public interface IMatchManager
{
    Match? GetMatch(Guid matchId);
    Match CreateMatch(string playerName, GameSettings? settings = null);
    Match JoinMatch(Guid matchId, string playerName);
    void RemoveMatch(Guid matchId);
    List<Match> GetActiveMatches();
}

// Services/MatchManager.cs
public class MatchManager : IMatchManager
{
    private readonly ConcurrentDictionary<Guid, Match> _matches = new();
    
    public Match? GetMatch(Guid matchId)
    {
        _matches.TryGetValue(matchId, out var match);
        return match;
    }
    
    public Match CreateMatch(string playerName, GameSettings? settings = null)
    {
        var match = new Match
        {
            Settings = settings ?? new GameSettings(),
            Players = new List<Player>
            {
                new Player { Name = playerName }
            }
        };
        
        _matches.TryAdd(match.Id, match);
        return match;
    }
    
    public Match JoinMatch(Guid matchId, string playerName)
    {
        var match = GetMatch(matchId) ?? throw new InvalidOperationException("Match not found");
        
        if (match.Phase != GamePhase.WaitingForPlayers)
        {
            throw new InvalidOperationException("Cannot join match in progress");
        }
        
        match.Players.Add(new Player { Name = playerName });
        return match;
    }
    
    public void RemoveMatch(Guid matchId)
    {
        _matches.TryRemove(matchId, out _);
    }
    
    public List<Match> GetActiveMatches()
    {
        return _matches.Values.ToList();
    }
}

// Hubs/GameHub.cs
public class GameHub : Hub
{
    private readonly IGameEngine _gameEngine;
    private readonly IMatchManager _matchManager;
    private readonly ConcurrentDictionary<Guid, Guid> _processedCommands = new();
    
    public GameHub(IGameEngine gameEngine, IMatchManager matchManager)
    {
        _gameEngine = gameEngine;
        _matchManager = matchManager;
    }
    
    public async Task<GameStateDto> CreateOrJoinMatch(CreateMatchRequest request)
    {
        Match match;
        
        try
        {
            // Try to create new match
            match = _matchManager.CreateMatch(request.PlayerName, request.Settings);
            await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{match.Id}");
        }
        catch
        {
            throw new HubException("Failed to create match");
        }
        
        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList()
        };
        
        await Clients.Group($"match:{match.Id}").SendAsync("StateUpdate", state, Guid.Empty);
        return state;
    }
    
    public async Task<Match> JoinExistingMatch(Guid matchId, string playerName)
    {
        var match = _matchManager.JoinMatch(matchId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"match:{matchId}");
        
        var state = new GameStateDto
        {
            MatchId = match.Id,
            Phase = match.Phase,
            Players = match.Players.Select(p => new PlayerStateDto
            {
                Id = p.Id,
                Name = p.Name,
                HandCount = p.Hand.Count,
                Score = p.Score,
                IsConnected = p.IsConnected
            }).ToList()
        };
        
        await Clients.Group($"match:{matchId}").SendAsync("StateUpdate", state, Guid.Empty);
        return match;
    }
    
    public async Task StartRound(Guid matchId)
    {
        var match = _matchManager.GetMatch(matchId);
        if (match == null) throw new HubException("Match not found");
        
        var state = _gameEngine.StartNewRound(match);
        await Clients.Group($"match:{matchId}").SendAsync("StateUpdate", state, Guid.Empty);
    }
    
    public async Task<GameStateDto> SubmitMove(SubmitMoveRequest request)
    {
        // Check for duplicate command (idempotency)
        if (_processedCommands.ContainsKey(request.ClientCmdId))
        {
            var match = _matchManager.GetMatch(request.MatchId);
            if (match != null)
            {
                return new GameStateDto { MatchId = request.MatchId, Phase = match.Phase };
            }
        }
        
        var gameMatch = _matchManager.GetMatch(request.MatchId);
        if (gameMatch == null) throw new HubException("Match not found");
        
        // Find player by connection (simplified - in real app would use proper auth)
        var playerId = gameMatch.Players[gameMatch.CurrentPlayerIndex].Id;
        
        try
        {
            var state = _gameEngine.SubmitMove(gameMatch, playerId, request);
            _processedCommands.TryAdd(request.ClientCmdId, request.MatchId);
            
            await Clients.Group($"match:{request.MatchId}").SendAsync("StateUpdate", state, request.ClientCmdId);
            return state;
        }
        catch (Exception ex)
        {
            throw new HubException($"Invalid move: {ex.Message}");
        }
    }
}