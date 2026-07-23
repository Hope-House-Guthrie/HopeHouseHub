var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api", () => "api route");
app.MapGet("/api/hello", () => "hello route");

app.Run();
