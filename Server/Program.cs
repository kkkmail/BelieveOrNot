var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSignalR();
builder.Services.AddSingleton<IGameEngine, GameEngine>();
builder.Services.AddSingleton<IMatchManager, MatchManager>();

builder.Services.AddCors(options =>
{
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
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapHub<GameHub>("/game");

app.Run();