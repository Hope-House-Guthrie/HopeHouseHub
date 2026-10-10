using System.Text;
using H3.Data;
using H3.Data.Entities;
using H3.Server.Extensions;
using H3.Server.Processors;
using H3.Queues.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Reflection;
using System;
using System.Linq;

var isOpenApiBuildReflectionStep = Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicyName = "development";
const string ProdCorsPolicyName = "production";

builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicyName, policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });

    options.AddPolicy(ProdCorsPolicyName, policy =>
    {
        const string key = "H3:Frontend:Origin";

        var origin = builder.Configuration[key];

        if (origin  == null) return;

        policy
            .WithOrigins(origin)
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.AddDatabase();

builder.Services.AddIdentity<User, Role>(options =>
{
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<HubDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtKey = builder.Configuration["JWT:Secret"] ?? Guid.NewGuid().ToString();
var jwtIssuer = builder.Configuration["JWT:Issuer"];
var jwtAudience = builder.Configuration["JWT:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
        ValidIssuer = jwtIssuer,
        ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
        ValidAudience = jwtAudience,
        ValidateLifetime = true
    };
});

builder.Services.AddAuthorization();

builder.Services.AddQueues(builder.Configuration, cfg =>
{
    cfg.AddConsumers();
});

builder.Services.AddHostedService<FormsProcessor>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseCors(DevCorsPolicyName);
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseCors(ProdCorsPolicyName);
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (!isOpenApiBuildReflectionStep && app.Environment.IsProduction())
{
    await app.MigrateDatabaseAsync();
}

app.Run();