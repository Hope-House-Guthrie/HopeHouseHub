using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapPost("/_form/client-inquiry", ([AsParameters] ClientInquiryForm form) => Results.Redirect(form.SuccessUrl))
   .DisableAntiforgery();

app.MapPost("/_form/volunteer-inquiry", ([AsParameters] VolunteerInquiryForm form) => Results.Redirect(form.SuccessUrl))
   .DisableAntiforgery();

app.Run();

public class ClientInquiryForm
{
    [FromForm(Name = "success_url")]
    [Required]
    public string SuccessUrl { get; init; } = string.Empty;
}

public class VolunteerInquiryForm
{
    [FromForm(Name = "success_url")]
    [Required]
    public string SuccessUrl { get; init; } = string.Empty;
}