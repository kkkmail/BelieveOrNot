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
