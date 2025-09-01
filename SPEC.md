# Believe Or Not -- SPEC

Version: 0.1 (initial draft)  
Scope: End-to-end rules and product requirements for a multiplayer desktop card game implemented with a server-authoritative model.

---

## 1) Overview

Believe Or Not is a bluffing card game for 2+ players. Players sit in a circle. On each turn the active player either:
- Play (Believe): place 1-3 face-down cards and (truthfully or not) claim they match the currently announced rank.
- Challenge (Do Not Believe): flip exactly one card from the face-down pile placed by the previous player only to test that claim.

Cards are dealt out to all players at the start of a round. The round ends when any player's hand becomes empty. Rounds repeat; points are tallied across rounds to rank players for the "game" session.

The server is authoritative; clients send intents and render state snapshots.

---

## 2) Terminology

- Game: A multi-round session among a chosen set of players with agreed rule tweaks and scoring weights.
- Round: A single deal+play until someone has no cards left.
- Turn: A single player action (Play or Challenge) while a claimed rank is active.
- Table pile: The face-down stack of all cards played since the last collection.
- Announced rank: The rank currently claimed by the last Play action in the table pile sequence.
- Dispose: Reveal and permanently remove a four-of-a-kind from a player's hand (jokers have special rules).

---

## 3) Setup

### 3.1 Deck configuration
At game start the game starter chooses:
- Deck size: one of 32, 36, 52 or 54 (standard ranks per region; see section 12).
- Jokers: integer >= 0; included as rank "Joker".  
- Joker disposal enabled: boolean (required if 4+ jokers are used to allow disposing 4 jokers as a set; see section 7).
- Scoring weights (defaults in parentheses):
  - ScorePerCard = -1
  - ScorePerJoker = -3
  - WinnerBonus = +5
- Invite timeout for template-based invites (default 300s).

### 3.2 Seating and dealer
- Players form a circle (server stores an ordered list).
- Dealer deals; the player to the dealer's left (index +1) makes the first move.
- First round's dealer is the game starter. Next round's dealer is the previous round's winner.

### 3.3 Dealing
- Shuffle the deck.
- Deal one card at a time clockwise until the deck is exhausted.
- Some players may have one more card than others (expected).

---

## 4) Round flow

A round consists of a sequence of turns and table collections:

1. Opening turn (no announced rank yet)  
   Active player must Play 1-3 cards face down and declare a rank (this becomes the announced rank).

2. Subsequent turns (announced rank fixed)  
   Active player chooses:
   - Play (Believe): place 1-3 more face-down cards, implicitly claiming they are of the same announced rank.  
   - Challenge (Do Not Believe): flip exactly one card from the face-down table pile but only from the part placed by the previus player (see section 6).

3. Collection  
   When a Challenge happens, one player collects all cards currently on the table pile (see section 6). The turn sequence resets:
   - The next first move (a new opening turn) is taken by the player to the left of the collector.
   - The first move will declare a new announced rank.

4. Round end  
   The round ends immediately when any player's hand becomes empty and the turn ends. Scoring is applied (section 8) and the winner becomes the next dealer (section 3.2).

---

## 5) Play action -- rules & validation

- Allowed only if a rank is already announced for the current table pile or it is the opening turn (in which case the player must set it).
- The player must place 1 to 3 cards face down. (Server enforces 1-3.)
- During a non-opening Play, the announced rank must not change.
- The physical cards placed may not match the claim (bluffing allowed).
- After a Play, the turn passes clockwise to the next player.

---

## 6) Challenge action -- resolution

When a player Challenges:
1. The challenger selects exactly one index within the current table pile but6 only from the cards placed by the prevous player (0-based from the top of the pile recommended; server may store canonical order).
2. Server flips that card (logically; clients display the outcome):
   - Hit (truthful): If the flipped card's rank equals the announced rank, the challenger must collect the entire table pile into their hand.
   - Miss (lie): Otherwise, the previous player (the one who made the last Play) collects the entire pile.
3. After a collection, the table pile is empty, there is no announced rank, and the next first move is taken by the player to the left of the collector.

Notes:
- Only one card is flipped and only one player collects.
- If the table pile is empty (should not happen), server rejects Challenge.
- A Challenge is always allowed when there is a non-empty table pile with an announced rank.

---

## 7) Disposing four-of-a-kind

- If a player holds four cards of the same non-joker rank, they are automatically disposed: removed from the game, and a notification is broadcast.
- Jokers:
  - If Joker disposal is enabled and there are 4 or more jokers in the deck, a player may dispose four Jokers at their discretion (not automatic).
  - Disposing Jokers never happens implicitly; the client must provide a specific DisposeJokers command or a Play wrapper that indicates "dispose now".
- Disposal may occur between turns or immediately after draw/collection if conditions are met (server validates and applies atomically with the triggering action).

---

## 8) Scoring

At end of a round:
- Each non-joker card in hand: ScorePerCard (default -1 point).
- Each Joker in hand: ScorePerJoker (default -3 points).
- Winner bonus: player(s) with zero cards at round end receive WinnerBonus (default +5). If multiple players reach zero simultaneously, all receive the bonus.
- A game consists of as many rounds as the group wishes; at game end, sum each player's points from all completed rounds and rank descending.

---

## 9) Seating & dealer rotation between rounds

- After scoring, players may be re-seated (shuffled order) before the next round; the winner of the last round becomes the new dealer.
- If re-seating is used, the server must persist the new order for the next deal.

---

## 10) Invitations, templates, and timeouts

- A Game Template is a named object containing:
  - A list of players (referenced by identity), optional short names (per template).
  - Rule tweaks: deck size, joker count, joker disposal enabled, scoring weights, invite timeout seconds.
- To start a game from a template:
  - The starter selects the template; server sends invitations (contains player list and rules) to all participants except the starter.
  - If not accepted before invite timeout, the starter may resend or exclude late players and proceed.
  - Starter becomes the first dealer for the first round.

---

## 11) Identity, reconnect, and persistence

- Identity: Each user has a stable PlayerId (GUID). Sign-in may be stubbed initially; later bind to Google ID/OIDC.
- Reconnect:
  - On connection, the server determines the user's active match (if any) and immediately pushes the latest snapshot (GameStateDto).
  - Clients should be able to re-join the SignalR group match:{MatchId} at any time.
- Persistence (phase 2):
  - Persist Matches, Players, seating, Moves, and snapshots of the latest state per match.
  - After server restart, players reconnect and receive the persisted latest snapshot.

---

## 12) Deck rank sets

- 32-card: { 7, 8, 9, 10, J, Q, K, A } x 4 suits.
- 36-card: { 6, 7, 8, 9, 10, J, Q, K, A } x 4 suits.
- 54-card: Standard 52-card ranks (2..A) x 4 suits + 2 extra cards* to reach 54 (implementation chooses either 2 jokers included here or adds via JokerCount; for this spec, the 54 size refers to rank set only, and JokerCount is added on top).  
  *Implementation note:* Use the project's DeckBuilder to generate the exact deck plus JokerCount.

---

## 13) Server-client contract (v0)

SignalR Hub: /game

### Methods (client -> server)
- CreateOrJoinMatch(CreateMatchRequest req): Creates or joins a match; deals and returns the first snapshot.
- SubmitMove(SubmitMoveRequest req): Submits a Play or Challenge:
  - req.Cards must be 1-3 for Play; req.ChallengePickIndex must be supplied for Challenge.
  - Server is idempotent per (MatchId, ClientCmdId).

(Optional later)  
- DisposeJokers(Guid matchId, Guid clientCmdId): Disposes four Jokers if allowed and available.

### Events (server -> clients in match group)
- StateUpdate(GameStateDto state, Guid clientCmdIdEcho): Broadcast after any accepted action (or initial join).

---

## 14) Validation & edge cases

- Play size: reject if Cards.Count not in 1..3.
- Opening turn: must set AnnouncedRank (server derives this from the declared rank in the Play call; clients provide it explicitly or via Cards metadata).
- Subsequent Play: reject if the announced rank would change.
- Challenge availability: only when table pile is non-empty and there is an announced rank.
- Empty-hand win: apply immediately, even if in the middle of a normal rotation.
- Idempotency: exact same (MatchId, ClientCmdId) must be a no-op returning the same resulting GameStateDto.
- Disconnect mid-turn: server keeps the match; if the current player disconnects, allow a short grace period (configurable) before skipping or letting others continue (policy to be decided; out of scope for v0).
- Four-of-a-kind auto-dispose timing: apply immediately upon entering a state where the hand contains four of the same non-joker rank (after deal, after collection, or after any action that changes the hand). Broadcast a small event or include the disposal in StateUpdate.

---

## 15) Statistics (optional, capture if available)

- Per round: number of challenges, success rate, largest single collection size, time per turn.
- Per game: total points, average hand size at challenge, most frequent announced ranks, bluff rate (if deducible).
- Provide an endpoint/UI to browse a user's history.

---

## 16) Non-goals (v0)

- Mobile UI (Android) and advanced visuals (the Avalonia client is a minimal desktop UI stub in v0).
- Spectator mode.
- Anti-cheat beyond server authority.
- Internationalization.

---

## 17) Acceptance criteria (engineering)

- Complete Rules Engine that enforces sections 4-7, 14 with unit tests (xUnit).
- Server hub that routes intents to the engine, maintains seating and table pile, and broadcasts StateUpdate.
- Idempotent command processing using ClientCmdId.
- Deterministic shuffles in tests (seeded).
- Round end scoring and next-dealer selection per sections 8-9.
- Persisted snapshots and reconnect behavior (phase 2).

---

## 18) Open questions

- Multiple winners: When two players hit zero simultaneously (e.g., disposal edge), confirm both receive WinnerBonus. (Current spec: Yes.)
- Challenge pick index: Canonical indexing from top of pile vs bottom? (Current: top.)
- Skip/disconnect policy: Define grace period and skip rules. (Out of scope v0; stub.)
- 54-card deck exact contents: Align with implementation in DeckBuilder (spec leaves it to code; tests should pin behavior).

---
