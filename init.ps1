# --- Config ---
$SolutionName = "BelieveOrNot"
$RepoRoot = "C:\GitHub\BelieveOrNot"
$Branch = "ai-main"

# --- Ensure repo exists & clean git init if needed ---
cd $RepoRoot
if (-not (Test-Path ".git")) { git init }

# --- Create solution ---
dotnet new sln -n $SolutionName

# --- Projects ---
dotnet new classlib -n BelieveOrNot.Shared -f net8.0 -o shared/BelieveOrNot.Shared
dotnet new classlib -n BelieveOrNot.Rules -f net8.0 -o rules/BelieveOrNot.Rules
dotnet new xunit    -n BelieveOrNot.Rules.Tests -f net8.0 -o rules/BelieveOrNot.Rules.Tests

dotnet new web -n BelieveOrNot.Server -f net8.0 -o server/BelieveOrNot.Server # minimal API template
dotnet new xunit -n BelieveOrNot.Server.Tests -f net8.0 -o server/BelieveOrNot.Server.Tests

dotnet new avalonia.app -n BelieveOrNot.Client.Avalonia -f net8.0 -o client/BelieveOrNot.Client.Avalonia `
 -lang C# --no-restore

# --- Add to solution ---
dotnet sln add shared/BelieveOrNot.Shared/BelieveOrNot.Shared.csproj
dotnet sln add rules/BelieveOrNot.Rules/BelieveOrNot.Rules.csproj
dotnet sln add rules/BelieveOrNot.Rules.Tests/BelieveOrNot.Rules.Tests.csproj
dotnet sln add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj
dotnet sln add server/BelieveOrNot.Server.Tests/BelieveOrNot.Server.Tests.csproj
dotnet sln add client/BelieveOrNot.Client.Avalonia/BelieveOrNot.Client.Avalonia.csproj

# --- References ---
dotnet add rules/BelieveOrNot.Rules/BelieveOrNot.Rules.csproj reference shared/BelieveOrNot.Shared/BelieveOrNot.Shared.csproj
dotnet add rules/BelieveOrNot.Rules.Tests/BelieveOrNot.Rules.Tests.csproj reference rules/BelieveOrNot.Rules/BelieveOrNot.Rules.csproj
dotnet add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj reference shared/BelieveOrNot.Shared/BelieveOrNot.Shared.csproj
dotnet add server/BelieveOrNot.Server.Tests/BelieveOrNot.Server.Tests.csproj reference server/BelieveOrNot.Server/BelieveOrNot.Server.csproj
dotnet add client/BelieveOrNot.Client.Avalonia/BelieveOrNot.Client.Avalonia.csproj reference shared/BelieveOrNot.Shared/BelieveOrNot.Shared.csproj

# --- Packages ---
dotnet add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj package Microsoft.AspNetCore.SignalR.Protocols.MessagePack
dotnet add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj package Microsoft.EntityFrameworkCore.SqlServer
dotnet add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj package Microsoft.EntityFrameworkCore.Design
dotnet add server/BelieveOrNot.Server/BelieveOrNot.Server.csproj package Serilog.AspNetCore

dotnet add client/BelieveOrNot.Client.Avalonia/BelieveOrNot.Client.Avalonia.csproj package Microsoft.AspNetCore.SignalR.Client
dotnet add client/BelieveOrNot.Client.Avalonia/BelieveOrNot.Client.Avalonia.csproj package Microsoft.AspNetCore.SignalR.Protocols.MessagePack

dotnet add rules/BelieveOrNot.Rules.Tests/BelieveOrNot.Rules.Tests.csproj package FluentAssertions
dotnet add server/BelieveOrNot.Server.Tests/BelieveOrNot.Server.Tests.csproj package FluentAssertions

# --- Shared DTOs ---
@"
namespace BelieveOrNot.Shared;

public enum Rank { Seven=7, Eight, Nine, Ten, Jack, Queen, King, Ace, Joker=99 }
public enum Suit { Clubs, Diamonds, Hearts, Spades, None=99 }

public readonly record struct Card(Rank Rank, Suit Suit);

public enum MoveType { Play, Challenge }
public sealed record SubmitMoveRequest(
    Guid MatchId, Guid ClientCmdId, int TurnNo, MoveType Type,
    IReadOnlyList<Card>? Cards = null, int? ChallengePickIndex = null);

public sealed record CreateMatchRequest(
    int DeckSize, int JokerCount, bool CanDisposeJokers,
    int ScoreCard = -1, int ScoreJoker = -3, int WinnerBonus = 5, int InviteTimeoutSec = 300);

public sealed record GameStateDto(
    Guid MatchId, Guid CurrentPlayerId, int TurnNo,
    IReadOnlyDictionary<Guid,int> HandCounts,
    int TableCount, Rank? AnnouncedRank, bool RoundEnded);

public sealed record ErrorDto(string Code, string Message);
"@ | Set-Content shared/BelieveOrNot.Shared/Cards.cs -Encoding UTF8

# --- Rules stubs ---
@"
using BelieveOrNot.Shared;
using System.Security.Cryptography;

namespace BelieveOrNot.Rules;

public static class DeckBuilder
{
    public static List<Card> Build(int deckSize, int jokers)
    {
        var deck = deckSize switch
        {
            32 => Ranks32().SelectMany(r => Suits().Select(s => new Card(r,s))).ToList(),
            36 => Ranks36().SelectMany(r => Suits().Select(s => new Card(r,s))).ToList(),
            54 => Ranks54().SelectMany(r => Suits().Select(s => new Card(r,s))).ToList(),
            _  => throw new ArgumentOutOfRangeException(nameof(deckSize))
        };
        deck.AddRange(Enumerable.Repeat(new Card(Rank.Joker, Suit.None), jokers));
        return deck;
    }

    public static void ShuffleInPlace(List<Card> deck, ReadOnlySpan<byte> seed)
    {
        // Fisher-Yates with CSPRNG seeded from seed bytes
        using var hmac = new HMACSHA256(seed.ToArray());
        for (int i = deck.Count - 1; i > 0; i--)
        {
            var bytes = hmac.ComputeHash(BitConverter.GetBytes(i));
            var rnd = BitConverter.ToUInt32(bytes, 0);
            var j = (int)(rnd % (uint)(i + 1));
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }

    private static IEnumerable<Rank> Ranks32() => new[] { Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };
    private static IEnumerable<Rank> Ranks36() => new[] { Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace }.Where(_=>true); // placeholder
    private static IEnumerable<Rank> Ranks54() => new[] { Rank.Ace, Rank.King, Rank.Queen, Rank.Jack, Rank.Ten, Rank.Nine, Rank.Eight, Rank.Seven, Rank.Six }.Where(_=>true); // placeholder

    private static IEnumerable<Suit> Suits() => new[] { Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades };
}
"@ | Set-Content rules/BelieveOrNot.Rules/DeckBuilder.cs -Encoding UTF8

@"
using BelieveOrNot.Shared;

namespace BelieveOrNot.Rules;

public sealed class RoundEngine
{
    public GameStateDto State { get; private set; }

    public RoundEngine(GameStateDto initial) => State = initial;

    public (GameStateDto next, ErrorDto? error) Submit(SubmitMoveRequest req)
    {
        // TODO: Validate turn, apply Play/Challenge, update piles, auto-dispose 4-of-a-kind, detect round end
        return (State, null);
    }
}
"@ | Set-Content rules/BelieveOrNot.Rules/RoundEngine.cs -Encoding UTF8

# --- Server: minimal hub + MessagePack ---
@"
using BelieveOrNot.Shared;
using Microsoft.AspNetCore.SignalR;

namespace BelieveOrNot.Server;

public class GameHub : Hub
{
    private static readonly string MatchGroup(Guid matchId) => $"match:{matchId:N}";

    public async Task CreateOrJoinMatch(CreateMatchRequest req)
    {
        // TODO: create match, seat player, add to SignalR group
        await Clients.Caller.SendAsync(""StateUpdate"", new GameStateDto(Guid.NewGuid(), Guid.NewGuid(), 0,
            new Dictionary<Guid,int>(), 0, null, false), Guid.Empty);
    }

    public async Task SubmitMove(SubmitMoveRequest req)
    {
        // TODO: authoritative validation and broadcast
        await Clients.Group(MatchGroup(req.MatchId)).SendAsync(""StateUpdate"", 
            new GameStateDto(req.MatchId, Guid.NewGuid(), req.TurnNo+1, new Dictionary<Guid,int>(), 0, null, false),
            req.ClientCmdId);
    }
}
"@ | Set-Content server/BelieveOrNot.Server/GameHub.cs -Encoding UTF8

@"
using Microsoft.AspNetCore.SignalR;
using BelieveOrNot.Server;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR()
    .AddMessagePackProtocol(); // MessagePack for compact payloads

builder.Services.AddHealthChecks();
builder.Host.UseWindowsService();

var app = builder.Build();

app.MapHealthChecks(""/healthz"");
app.MapHub<GameHub>(""/game"");

app.Run();
"@ | Set-Content server/BelieveOrNot.Server/Program.cs -Encoding UTF8

# --- Server csproj: slim + WindowsService ---
(Get-Content server/BelieveOrNot.Server/BelieveOrNot.Server.csproj) `
 -replace "</Project>", @"
  <ItemGroup>
    <PackageReference Include=""Microsoft.AspNetCore.SignalR.Protocols.MessagePack"" Version=""9.*"" />
    <PackageReference Include=""Microsoft.EntityFrameworkCore.SqlServer"" Version=""9.*"" />
    <PackageReference Include=""Microsoft.EntityFrameworkCore.Design"" Version=""9.*"" />
    <PackageReference Include=""Serilog.AspNetCore"" Version=""8.*"" />
  </ItemGroup>
  <PropertyGroup>
    <PublishSingleFile>true</PublishSingleFile>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
  </PropertyGroup>
</Project>" | Set-Content server/BelieveOrNot.Server/BelieveOrNot.Server.csproj -Encoding UTF8

# --- Client: SignalR connect stub ---
@"
using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Microsoft.AspNetCore.SignalR.Client;
using MessagePack;

namespace BelieveOrNot.Client;

public partial class MainWindow : Window
{
    HubConnection? _hub;

    public MainWindow()
    {
        InitializeComponent();
        this.Opened += async (_,__) =>
        {
            _hub = new HubConnectionBuilder()
                .WithUrl(""http://localhost:5000/game"")
                .AddMessagePackProtocol()
                .WithAutomaticReconnect()
                .Build();

            _hub.On<object, System.Guid>(""StateUpdate"", (state, cmdId) =>
            {
                Console.WriteLine($""StateUpdate received. Cmd={cmdId}"");
            });

            await _hub.StartAsync();
            await _hub.InvokeAsync(""CreateOrJoinMatch"", new {
                DeckSize = 32, JokerCount = 0, CanDisposeJokers = true, ScoreCard = -1, ScoreJoker = -3, WinnerBonus = 5, InviteTimeoutSec = 300
            });
        };
    }
}
"@ | Set-Content client/BelieveOrNot.Client.Avalonia/MainWindow.axaml.cs -Encoding UTF8

# --- .gitignore and editorconfig ---
@"
bin/
obj/
*.user
*.suo
*.swp
*.DS_Store
.vscode/
.idea/
"@ | Set-Content .gitignore -Encoding UTF8

@"
root = true
[*.cs]
dotnet_diagnostic.CA2007.severity = suggestion
end_of_line = lf
indent_style = space
indent_size = 4
"@ | Set-Content .editorconfig -Encoding UTF8

# --- GitHub Actions: server build/test ---
New-Item -ItemType Directory -Force -Path .github/workflows | Out-Null
@"
name: server-ci
on:
  push: { branches: [ $Branch ] }
  pull_request: { branches: [ $Branch ] }
jobs:
  build:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-dotnet@v4
      with: { dotnet-version: '8.0.x' }
    - name: Restore
      run: dotnet restore
    - name: Build
      run: dotnet build -c Release --no-restore
    - name: Test
      run: dotnet test -c Release --no-build
"@ | Set-Content .github/workflows/server-ci.yml -Encoding UTF8

# --- GitHub Actions: client build (no signing) ---
@"
name: client-ci
on:
  push: { branches: [ $Branch ] }
  pull_request: { branches: [ $Branch ] }
jobs:
  build-client:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-dotnet@v4
      with: { dotnet-version: '8.0.x' }
    - name: Restore
      run: dotnet restore
    - name: Build Avalonia
      run: dotnet build client/BelieveOrNot.Client.Avalonia -c Release --no-restore
"@ | Set-Content .github/workflows/client-ci.yml -Encoding UTF8

# --- Initial build to ensure compiles ---
dotnet restore
dotnet build -c Release

# --- Commit to ai-main ---
git checkout -b $Branch
git add .
git commit -m "feat(scaffold): initial solution with server SignalR hub (/game), shared DTOs, rules stubs, Avalonia client, and CI"
# If remote set up:
# git remote add origin https://github.com/kkkmail/BelieveOrNot.git
# git push -u origin $Branch
