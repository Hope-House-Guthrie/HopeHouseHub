using H3.Data;
using H3.Endpoints;
using Scalar.AspNetCore;
using System.Reflection;

var isOpenApiBuildReflectionStep = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicyName = "development";

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicyName, policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

builder.AddDatabase();

var app = builder.Build();

app.MapClientEndpoints();
app.MapMaintenanceEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseCors(DevCorsPolicyName);
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!isOpenApiBuildReflectionStep && app.Environment.IsProduction())
{
    await app.MigrateDatabaseAsync();
}

app.Run();