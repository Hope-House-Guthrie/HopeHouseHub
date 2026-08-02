using H3.Data;
using H3.Endpoints;
using Scalar.AspNetCore;
using System.Reflection;

var isOpenApiBuildReflectionStep = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.AddDatabase();

var app = builder.Build();

app.MapClientEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!isOpenApiBuildReflectionStep && app.Environment.IsProduction())
{
    await app.MigrateDatabaseAsync();
}

app.Run();