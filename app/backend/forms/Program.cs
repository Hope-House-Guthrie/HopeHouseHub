using H3.Forms.Requests;
using H3.Queues.Extensions;
using H3.Queues.Producers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddQueues(builder.Configuration, cfg =>
{
    cfg
        .AddProducers()
        .AddConsumers();
});

var app = builder.Build();

app
    .MapPost("/_form/client-inquiry", async (ClientInquiryRequest request, IQueueProducer queueProducer) =>
    {
        await queueProducer.AddClientInquiryAsync(request.Model);
        return Results.Redirect(request.SuccessUrl);
    })
    .DisableAntiforgery();

app
    .MapPost("/_form/volunteer-inquiry", async (VolunteerInquiryRequest request, IQueueProducer queueProducer) =>
    {
        await queueProducer.AddVolunteerInquiryAsync(request.Model);
        return Results.Redirect(request.SuccessUrl);
    })
    .DisableAntiforgery();

app.Run();