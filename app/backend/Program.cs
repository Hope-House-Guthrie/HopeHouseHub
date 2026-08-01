using H3.Data;
using H3.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.AddDatabase();

var app = builder.Build();

app.MapClientEndpoints();

app.Run();