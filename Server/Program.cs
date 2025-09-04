using BelieveOrNot.Server;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Services.Configure<GameSettings>(
    builder.Configuration.GetSection("GameSettings"));

// Add services
builder.Services.AddSignalR();
builder.Services.AddSingleton<IMatchManager, MatchManager>();
builder.Services.AddSingleton<IGameEngine, GameEngine>();

builder.Services.AddCors(options =>
{
    var corsOrigin = builder.Configuration.GetValue<string>("ServerSettings:DefaultCorsOrigin") ?? "*";
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors();

var staticFilesEnabled = app.Configuration.GetValue<bool>("ServerSettings:StaticFilesEnabled", true);
if (staticFilesEnabled)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

var hubPath = app.Configuration.GetValue<string>("ServerSettings:SignalRHubPath") ?? "/game";
app.MapHub<GameHub>(hubPath);

app.Run();