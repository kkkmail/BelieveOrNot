# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Restore, build, test (CI pipeline)
dotnet restore
dotnet build -c Release --no-restore
dotnet test -c Release --no-build

# Run the server locally (serves frontend at http://192.168.1.89:4999)
dotnet run --project Server/BelieveOrNot.Server.csproj
```

The solution file is `BelieveOrNot.slnx`. There is currently one project (`Server/BelieveOrNot.Server.csproj`) and no test project. CI runs on Windows via GitHub Actions (`.github/workflows/server-ci.yml`) targeting the `ai-main` branch.

## Tech Stack

- **.NET 9.0** (SDK 9.0.100, `global.json` with `rollForward: latestFeature`)
- **ASP.NET Core** with SignalR for real-time WebSocket communication
- **Vanilla JavaScript** (ES6 modules) frontend served as static files from `Server/wwwroot/`
- Deployable as a **Windows Service** (PowerShell scripts in `Server/`)

## Architecture

Server-authoritative multiplayer card game platform implementing two games: **Believe Or Not** (bluffing game) and **King** (trick-taking game).

### Signal Flow

```
Browser (vanilla JS, ES6 modules)
    ↕ SignalR WebSocket
SignalR Hub (GameHub at /game, KingHub at /kingHub)
    ↕
Game Engine (IGameEngine / IKingGameEngine)
    ↕
Match Manager (IMatchManager / IKingMatchManager) — in-memory ConcurrentDictionary
```

All services are registered as **singletons** in `Server/Program.cs`. State is held in memory (not persisted).

### Server Layout (`Server/`)

- **`BelieveOrNot/`** — Primary game: `GameHub` (SignalR), `GameEngine` (rules), `MatchManager` (sessions), DTOs, event system
- **`King/`** — Secondary game: parallel structure with `KingHub`, `KingGameEngine`, `KingMatchManager`, `KingScorer`, `KingMoveValidator`
- **`Shared/`** — Domain models shared between games: `Card`, `Player`, `Rank`, `Suit`, `DeckBuilder`, `GamePhase`
- **`wwwroot/`** — Frontend: `js/` (73 modules), `styles/` (29 CSS files), `king/` (King game UI)

### Partial Class Pattern

Both `GameEngine` and `GameHub` (and their King counterparts) use **partial classes split by responsibility**:
- `GameEngine.cs` — base interface & DI
- `GameEngine_StartNewRound.cs`, `GameEngine_SubmitMove.cs`, `GameEngine_HandlePlayAction.cs`, etc.
- `GameHub.cs` — connection lifecycle
- `GameHub_CreateOrJoinMatch.cs`, `GameHub_SubmitMove.cs`, `GameHub_BroadcastPersonalizedStates.cs`, etc.

### Frontend Module Structure (`Server/wwwroot/js/`)

- **`core/`** — Connection management (`initializeConnection.js`), global state (`variables.js`)
- **`actions/`** — Game actions (play cards, challenge, new game)
- **`display/`** — UI rendering
- **`game/`** — Client-side game logic
- **`cards/`** — Card display utilities
- **`utils/`** — Helpers, game router between BelieveOrNot and King

Entry point: `initialization.js` → routes via `gameRouter.js` to the appropriate game.

## Key Conventions

- **C# naming**: PascalCase hub methods, `I` prefix for interfaces, `Dto` suffix for transfer objects
- **Nullable** reference types enabled; **implicit usings** enabled
- **Global usings** in the project cover System.*, Collections.Concurrent, Linq, SignalR, and BelieveOrNot.Server.Shared
- **Concurrency**: `ConcurrentDictionary` for match storage and player connection tracking; idempotent command processing via `ClientCmdId`
- **Personalized state**: Server sends different `GameStateDto` to each player (hides other players' hands)
- **Events**: `GameEventFactory` creates typed `GameEventDto` objects with emoji icons for the UI

## Game Rules Reference

Full game specification is in `SPEC.md`. Key mechanics:
- Players play 1–3 face-down cards claiming a rank, or challenge the previous player's claim
- Challenge flips one card; loser collects the entire table pile
- Four-of-a-kind auto-disposed; optional joker disposal
- Scoring: -1/card, -3/joker, +5 for emptying hand first
