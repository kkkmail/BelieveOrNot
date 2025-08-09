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
