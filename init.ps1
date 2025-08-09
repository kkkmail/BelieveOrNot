<#
  BelieveOrNot bootstrapper (diagnostic + hardened)
  - Adds argument validation and detailed logging inside Ensure-Project + Invoke-Dotnet.
  - Uses NAMED PARAMETERS at all call sites to avoid positional/array binding slips.
  - Idempotent: safe to re-run after deleting newly-created files.
  - Creates/updates solution, projects, references, packages, code stubs, CI.
  - Commits to branch 'ai-main' if repo is git-initialized.

  Run from repo root: C:\GitHub\BelieveOrNot
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -------------------------
# Config
# -------------------------
$SolutionName = "BelieveOrNot"
$Branch       = "ai-main"
$Root         = (Get-Location).Path

# -------------------------
# Helpers
# -------------------------
function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "[ERROR] $m" -ForegroundColor Red; throw $m }

function Invoke-Dotnet([Parameter(Mandatory=$true)][string[]]$Args){
  # Normalize to an array before counting
  $nonEmpty = @($Args | Where-Object { $_ -is [string] -and $_.Trim().Length -gt 0 })
  if (-not $nonEmpty -or $nonEmpty.Count -eq 0) {
    Fail "Invoke-Dotnet called with no arguments or only empty strings."
  }

  $joined = ($nonEmpty -join ' ')
  Info ("dotnet {0}" -f $joined)

  & dotnet @nonEmpty
  $exit = $LASTEXITCODE
  if ($exit -ne 0) {
    Fail ("dotnet failed (exit {0}): {1}" -f $exit, $joined)
  }
}

function Ensure-Dir($p){
  if ([string]::IsNullOrWhiteSpace($p)) { return }  # allow files in repo root (e.g., ".gitignore")
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

function Read-FileOrEmpty([string]$p){ if(Test-Path $p){ Get-Content $p -Raw } else { "" } }

function Ensure-File([string]$path, [string]$content){
  $dir = Split-Path -Parent $path
  if ([string]::IsNullOrWhiteSpace($dir)) { $dir = "." } # root file -> no parent path
  Ensure-Dir $dir
  $cur = if (Test-Path $path) { Get-Content $path -Raw } else { "" }
  if ($cur -ne $content) { $content | Set-Content -Path $path -Encoding UTF8 }
}

function Ensure-Solution(){
  $sln = Join-Path $Root "$SolutionName.sln"
  if(-not (Test-Path $sln)){
    Invoke-Dotnet -Args @("new","sln","-n",$SolutionName)
  } else { Info "Solution exists" }
}

function Ensure-AvaloniaTemplates(){
  $list = (& dotnet new --list 2>$null) | Out-String
  if($list -notmatch 'avalonia\.app'){
    Invoke-Dotnet -Args @("new","install","Avalonia.Templates")
  } else { Info "Avalonia templates present" }
}

function Ensure-Project(
  [Parameter(Mandatory=$true)][string[]]$NewArgs,
  [Parameter(Mandatory=$true)][string]$ProjPath
){
  # Defensive checks + verbose diagnostics
  if (-not $NewArgs) { Fail "Ensure-Project: NewArgs is null/empty for ProjPath='$ProjPath'." }
  $nonEmpty = $NewArgs | Where-Object { $_ -is [string] -and $_.Trim().Length -gt 0 }
  if ($nonEmpty.Count -eq 0) { Fail "Ensure-Project: all NewArgs entries are empty strings for '$ProjPath'." }
  if (-not ($NewArgs[0] -eq "new" -or $NewArgs[0] -eq "NEW")) {
    Warn "Ensure-Project: NewArgs[0] is not 'new'. Actual: '$($NewArgs[0])'. Full: $($NewArgs -join ' ')"
  }
  Info ("Ensure-Project: target '{0}' with args: dotnet {1}" -f $ProjPath, ($NewArgs -join ' '))

  if(-not (Test-Path $ProjPath)){
    Invoke-Dotnet -Args $NewArgs
    if(-not (Test-Path $ProjPath)){
      Fail "Expected project was not created: $ProjPath. Args used: dotnet $($NewArgs -join ' ')"
    }
  } else { Info "Project exists: $ProjPath" }
}

function InSolution([string]$projPath){
  $list = (& dotnet sln "$SolutionName.sln" list 2>$null) | Out-String
  return ($list -match [Regex]::Escape($projPath))
}

function Ensure-AddedToSolution([Parameter(Mandatory=$true)][string]$ProjPath){
  if(-not (Test-Path $ProjPath)){ Fail "Missing project to add to solution: $ProjPath" }
  if(-not (InSolution $ProjPath)){
    Invoke-Dotnet -Args @("sln","$SolutionName.sln","add",$ProjPath)
  } else { Info "Already in solution: $ProjPath" }
}

function Ensure-ProjectRef(
  [Parameter(Mandatory=$true)][string]$FromProj,
  [Parameter(Mandatory=$true)][string]$ToProj
){
  if(-not (Test-Path $FromProj)){ Fail "Ref source missing: $FromProj" }
  if(-not (Test-Path $ToProj)){ Fail "Ref target missing: $ToProj" }

  $xml = [xml](Get-Content $FromProj -Raw)
  if(-not $xml.Project){ Fail "Invalid csproj XML: $FromProj" }

  # Handle projects with no ItemGroup/ProjectReference gracefully
  $nodes = $xml.SelectNodes("//Project/ItemGroup/ProjectReference")
  $hasRef = $false
  if($nodes){
    foreach($pr in $nodes){
      if($pr.Include){
        $abs = Resolve-Path -LiteralPath (Join-Path (Split-Path $FromProj) $pr.Include) -ErrorAction SilentlyContinue
        $toAbs = Resolve-Path -LiteralPath $ToProj -ErrorAction SilentlyContinue
        if($abs -and $toAbs -and ($abs -eq $toAbs)){ $hasRef = $true; break }
      }
    }
  }

  if(-not $hasRef){
    Invoke-Dotnet -Args @("add",$FromProj,"reference",$ToProj)
  } else {
    Info "Reference already present: $(Split-Path -Leaf $ToProj) -> $(Split-Path -Leaf $FromProj)"
  }
}

function Ensure-Package([Parameter(Mandatory=$true)][string]$ProjPath, [Parameter(Mandatory=$true)][string]$Pkg){
  if(-not (Test-Path $ProjPath)){ Fail "Cannot add package; missing: $ProjPath" }
  $xml = Get-Content $ProjPath -Raw
  if($xml -match [Regex]::Escape("Include=`"$Pkg`"")){ Info "Package exists: $Pkg in $(Split-Path -Leaf $ProjPath)" }
  else { Invoke-Dotnet -Args @("add",$ProjPath,"package",$Pkg) }
}

function Csproj-EnsureServerPublishProps([Parameter(Mandatory=$true)][string]$ProjPath){
  if(-not (Test-Path $ProjPath)){ Fail "Server .csproj not found: $ProjPath" }
  $xml = New-Object System.Xml.XmlDocument
  $xml.PreserveWhitespace = $true
  $xml.Load($ProjPath)
  $proj = $xml.Project; if(-not $proj){ Fail "Invalid csproj XML: $ProjPath" }
  $pg = ($proj.PropertyGroup | Where-Object { -not $_.GetAttribute("Condition") } | Select-Object -First 1)
  if(-not $pg){ $pg = $xml.CreateElement("PropertyGroup"); [void]$proj.AppendChild($pg) }
  $map = @{ PublishSingleFile="true"; RuntimeIdentifier="win-x64"; SelfContained="true" }
  $changed = $false
  foreach ($k in $map.Keys){
    $n = $pg.SelectSingleNode($k)
    if(-not $n){ $n = $xml.CreateElement($k); $n.InnerText = $map[$k]; [void]$pg.AppendChild($n); $changed = $true }
  }
  if($changed){ $xml.Save($ProjPath); Info "Updated publish props in $(Split-Path -Leaf $ProjPath)" }
  else { Info "Publish props already present" }
}

function Git-Commit([Parameter(Mandatory=$true)][string]$Branch, [Parameter(Mandatory=$true)][string]$Message){
  if(-not (Test-Path ".git")){ Warn "No .git folder; skipping git."; return }
  $exists = (git branch --list $Branch)
  if(-not $exists){ & git checkout -b $Branch | Out-Null } else { & git checkout $Branch | Out-Null }
  & git add -A | Out-Null
  $dirty = (& git status --porcelain)
  if($dirty){ & git commit -m $Message | Out-Null; Info "Committed to $Branch" } else { Info "No changes to commit" }
}

# -------------------------
# Paths
# -------------------------
$sharedProj     = "shared/BelieveOrNot.Shared/BelieveOrNot.Shared.csproj"
$rulesProj      = "rules/BelieveOrNot.Rules/BelieveOrNot.Rules.csproj"
$rulesTestProj  = "rules/BelieveOrNot.Rules.Tests/BelieveOrNot.Rules.Tests.csproj"
$serverProj     = "server/BelieveOrNot.Server/BelieveOrNot.Server.csproj"
$serverTestProj = "server/BelieveOrNot.Server.Tests/BelieveOrNot.Server.Tests.csproj"
$clientProj     = "client/BelieveOrNot.Client.Avalonia/BelieveOrNot.Client.Avalonia.csproj"

# -------------------------
# Create solution & projects
# -------------------------
Ensure-Solution
Ensure-AvaloniaTemplates

Ensure-Project -NewArgs @("new","classlib","-n","BelieveOrNot.Shared","-f","net8.0","-o","shared/BelieveOrNot.Shared") -ProjPath $sharedProj
Ensure-Project -NewArgs @("new","classlib","-n","BelieveOrNot.Rules","-f","net8.0","-o","rules/BelieveOrNot.Rules") -ProjPath $rulesProj
Ensure-Project -NewArgs @("new","xunit","-n","BelieveOrNot.Rules.Tests","-f","net8.0","-o","rules/BelieveOrNot.Rules.Tests") -ProjPath $rulesTestProj
Ensure-Project -NewArgs @("new","web","-n","BelieveOrNot.Server","-f","net8.0","-o","server/BelieveOrNot.Server") -ProjPath $serverProj
Ensure-Project -NewArgs @("new","xunit","-n","BelieveOrNot.Server.Tests","-f","net8.0","-o","server/BelieveOrNot.Server.Tests") -ProjPath $serverTestProj
Ensure-Project -NewArgs @("new","avalonia.app","-n","BelieveOrNot.Client.Avalonia","-f","net8.0","-o","client/BelieveOrNot.Client.Avalonia") -ProjPath $clientProj

Ensure-AddedToSolution -ProjPath $sharedProj
Ensure-AddedToSolution -ProjPath $rulesProj
Ensure-AddedToSolution -ProjPath $rulesTestProj
Ensure-AddedToSolution -ProjPath $serverProj
Ensure-AddedToSolution -ProjPath $serverTestProj
Ensure-AddedToSolution -ProjPath $clientProj

Ensure-ProjectRef -FromProj $rulesProj -ToProj $sharedProj
Ensure-ProjectRef -FromProj $rulesTestProj -ToProj $rulesProj
Ensure-ProjectRef -FromProj $serverProj -ToProj $sharedProj
Ensure-ProjectRef -FromProj $serverTestProj -ToProj $serverProj
Ensure-ProjectRef -FromProj $clientProj -ToProj $sharedProj

# -------------------------
# Packages
# -------------------------
Ensure-Package -ProjPath $serverProj -Pkg "Microsoft.AspNetCore.SignalR.Protocols.MessagePack"
Ensure-Package -ProjPath $serverProj -Pkg "Microsoft.EntityFrameworkCore.SqlServer"
Ensure-Package -ProjPath $serverProj -Pkg "Microsoft.EntityFrameworkCore.Design"
Ensure-Package -ProjPath $serverProj -Pkg "Serilog.AspNetCore"

Ensure-Package -ProjPath $clientProj -Pkg "Microsoft.AspNetCore.SignalR.Client"
Ensure-Package -ProjPath $clientProj -Pkg "Microsoft.AspNetCore.SignalR.Protocols.MessagePack"

Ensure-Package -ProjPath $rulesTestProj  -Pkg "FluentAssertions"
Ensure-Package -ProjPath $serverTestProj -Pkg "FluentAssertions"

# -------------------------
# Shared DTOs / Enums
# -------------------------
$sharedCards = @'
namespace BelieveOrNot.Shared;

public enum Rank
{
    Two = 2, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace,
    Joker = 99
}
public enum Suit { Clubs, Diamonds, Hearts, Spades, None = 99 }

public readonly record struct Card(Rank Rank, Suit Suit);

public enum MoveType { Play, Challenge }

public sealed record SubmitMoveRequest(
    System.Guid MatchId, System.Guid ClientCmdId, int TurnNo, MoveType Type,
    System.Collections.Generic.IReadOnlyList<Card>? Cards = null,
    int? ChallengePickIndex = null);

public sealed record CreateMatchRequest(
    int DeckSize, int JokerCount, bool CanDisposeJokers,
    int ScoreCard = -1, int ScoreJoker = -3, int WinnerBonus = 5, int InviteTimeoutSec = 300);

public sealed record GameStateDto(
    System.Guid MatchId, System.Guid CurrentPlayerId, int TurnNo,
    System.Collections.Generic.IReadOnlyDictionary<System.Guid,int> HandCounts,
    int TableCount, Rank? AnnouncedRank, bool RoundEnded);

public sealed record ErrorDto(string Code, string Message);
'@
Ensure-File -path "shared/BelieveOrNot.Shared/Cards.cs" -content $sharedCards

# -------------------------
# Rules stubs
# -------------------------
$deckBuilder = @'
using BelieveOrNot.Shared;
using System.Linq;
using System.Security.Cryptography;

namespace BelieveOrNot.Rules;

public static class DeckBuilder
{
    public static System.Collections.Generic.List<Card> Build(int deckSize, int jokers)
    {
        var deck = deckSize switch
        {
            32 => Ranks32().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            36 => Ranks36().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            54 => Ranks54().SelectMany(r => SuitsAll().Select(s => new Card(r, s))).ToList(),
            _  => throw new ArgumentOutOfRangeException(nameof(deckSize))
        };

        deck.AddRange(Enumerable.Repeat(new Card(Rank.Joker, Suit.None), jokers));
        return deck;
    }

    public static void ShuffleInPlace(System.Collections.Generic.List<Card> deck, ReadOnlySpan<byte> seed)
    {
        using var hmac = new HMACSHA256(seed.ToArray());
        for (int i = deck.Count - 1; i > 0; i--)
        {
            var bytes = hmac.ComputeHash(BitConverter.GetBytes(i));
            var rnd = BitConverter.ToUInt32(bytes, 0);
            var j = (int)(rnd % (uint)(i + 1));
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }

    private static IEnumerable<Rank> Ranks32()
        => new[] { Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Rank> Ranks36()
        => new[] { Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Rank> Ranks54()
        => new[] { Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

    private static IEnumerable<Suit> SuitsAll()
        => new[] { Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades };
}
'@
Ensure-File -path "rules/BelieveOrNot.Rules/DeckBuilder.cs" -content $deckBuilder

$roundEngine = @'
using BelieveOrNot.Shared;

namespace BelieveOrNot.Rules;

public sealed class RoundEngine
{
    public GameStateDto State { get; private set; }

    public RoundEngine(GameStateDto initial) => State = initial;

    public (GameStateDto next, ErrorDto? error) Submit(SubmitMoveRequest req)
    {
        // TODO: Validate turn, apply Play/Challenge, manage piles, auto-dispose 4-of-a-kind, detect round end.
        return (State, null);
    }
}
'@
Ensure-File -path "rules/BelieveOrNot.Rules/RoundEngine.cs" -content $roundEngine

# -------------------------
# Server: hub + Program
# -------------------------
$serverHub = @'
using BelieveOrNot.Shared;
using Microsoft.AspNetCore.SignalR;

namespace BelieveOrNot.Server;

public class GameHub : Hub
{
    private static string MatchGroup(System.Guid matchId) => $"match:{matchId:N}";

    public async Task CreateOrJoinMatch(CreateMatchRequest req)
    {
        // TODO: Create/lookup match, seat player, add to SignalR group.
        await Clients.Caller.SendAsync("StateUpdate",
            new GameStateDto(System.Guid.NewGuid(), System.Guid.NewGuid(), 0,
                new Dictionary<System.Guid,int>(), 0, null, false),
            System.Guid.Empty);
    }

    public async Task SubmitMove(SubmitMoveRequest req)
    {
        // TODO: Validate + apply via RoundEngine, broadcast update.
        await Clients.Group(MatchGroup(req.MatchId)).SendAsync("StateUpdate",
            new GameStateDto(req.MatchId, System.Guid.NewGuid(), req.TurnNo + 1,
                new Dictionary<System.Guid,int>(), 0, null, false),
            req.ClientCmdId);
    }
}
'@
Ensure-File -path "server/BelieveOrNot.Server/GameHub.cs" -content $serverHub

$serverProgram = @'
using BelieveOrNot.Server;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR().AddMessagePackProtocol();
builder.Services.AddHealthChecks();

builder.Host.UseWindowsService();
builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();

app.MapHealthChecks("/healthz");
app.MapHub<GameHub>("/game");

app.Run();
'@
Ensure-File -path "server/BelieveOrNot.Server/Program.cs" -content $serverProgram

Csproj-EnsureServerPublishProps -ProjPath (Join-Path $Root $serverProj)

# -------------------------
# Client: MainWindow stub
# -------------------------
$clientMainWin = @'
using Avalonia.Controls;
using Microsoft.AspNetCore.SignalR.Client;

namespace BelieveOrNot.Client.Avalonia;

public partial class MainWindow : Window
{
    HubConnection? _hub;

    public MainWindow()
    {
        InitializeComponent();

        this.Opened += async (_, __) =>
        {
            _hub = new HubConnectionBuilder()
                .WithUrl("http://localhost:5000/game")
                .AddMessagePackProtocol()
                .WithAutomaticReconnect()
                .Build();

            _hub.On<object, System.Guid>("StateUpdate", (state, cmdId) =>
            {
                System.Console.WriteLine($"StateUpdate received. Cmd={cmdId}");
            });

            await _hub.StartAsync();

            await _hub.InvokeAsync("CreateOrJoinMatch", new {
                DeckSize = 32, JokerCount = 0, CanDisposeJokers = true,
                ScoreCard = -1, ScoreJoker = -3, WinnerBonus = 5, InviteTimeoutSec = 300
            });
        };
    }
}
'@
Ensure-File -path "client/BelieveOrNot.Client.Avalonia/MainWindow.axaml.cs" -content $clientMainWin

# -------------------------
# .gitignore & .editorconfig
# -------------------------
Ensure-File -path ".gitignore" -content @'
bin/
obj/
*.user
*.suo
*.swp
*.DS_Store
.vscode/
.idea/
'@

Ensure-File -path ".editorconfig" -content @'
root = true

[*.cs]
indent_style = space
indent_size = 4
end_of_line = lf
dotnet_diagnostic.CA2007.severity = suggestion
'@

# -------------------------
# GitHub Actions
# -------------------------
Ensure-Dir ".github/workflows"
Ensure-File -path ".github/workflows/server-ci.yml" -content @"
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
      with:
        dotnet-version: '8.0.x'
    - name: Restore
      run: dotnet restore
    - name: Build
      run: dotnet build -c Release --no-restore
    - name: Test
      run: dotnet test -c Release --no-build
"@

Ensure-File -path ".github/workflows/client-ci.yml" -content @"
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
      with:
        dotnet-version: '8.0.x'
    - name: Restore
      run: dotnet restore
    - name: Build Avalonia
      run: dotnet build client/BelieveOrNot.Client.Avalonia -c Release --no-restore
"@

# -------------------------
# Restore & Build
# -------------------------
Invoke-Dotnet -Args @("restore")
Invoke-Dotnet -Args @("build","-c","Release")

# -------------------------
# Commit on ai-main (if repo)
# -------------------------
Git-Commit -Branch $Branch -Message "feat(scaffold): server hub (/game), Avalonia client, shared DTOs, rules stubs, CI (diagnostic bootstrapper)"
