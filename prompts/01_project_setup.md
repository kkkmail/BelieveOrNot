Create a new C# project structure for the "Believe Or Not" multiplayer card game with the following requirements:

1. Create a solution with these projects:
   - BelieveOrNot.Core (class library) - game rules engine
   - BelieveOrNot.Server (ASP.NET Core) - SignalR server
   - BelieveOrNot.Shared (class library) - DTOs and contracts
   - BelieveOrNot.Tests (xUnit test project)

2. Set up proper project references:
   - Server references Core and Shared
   - Tests references Core and Shared
   - Core references Shared

3. Add these NuGet packages:
   - BelieveOrNot.Server: Microsoft.AspNetCore.SignalR
   - BelieveOrNot.Tests: xunit, xunit.runner.visualstudio, Microsoft.NET.Test.Sdk

4. Create basic folder structure in Core:
   - Models/ (game entities)
   - Engine/ (game logic)
   - Services/ (deck builder, etc)

5. Create a README.md explaining the project structure and how to run tests

After creating the structure, run `dotnet build` to ensure everything compiles correctly.
