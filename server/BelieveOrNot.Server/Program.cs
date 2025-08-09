using BelieveOrNot.Server;
using Microsoft.Extensions.Hosting.WindowsServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR().AddMessagePackProtocol();
builder.Services.AddHealthChecks();

builder.Host.UseWindowsService();
builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();

app.MapHealthChecks("/healthz");
app.MapHub<GameHub>("/game");

app.Run();
