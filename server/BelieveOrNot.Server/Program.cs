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
