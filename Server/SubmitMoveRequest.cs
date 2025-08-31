public class SubmitMoveRequest
{
    public Guid MatchId { get; set; }
    public Guid ClientCmdId { get; set; }
    public ActionType Action { get; set; }
    public List<Card>? Cards { get; set; }
    public string? DeclaredRank { get; set; }
    public int? ChallengePickIndex { get; set; }
}