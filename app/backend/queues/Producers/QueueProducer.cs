using H3.Queues.Models;
using MassTransit;
using System;
using System.Threading.Tasks;

namespace H3.Queues.Producers;

public class QueueProducer(ISendEndpointProvider sendEndpointProvider) 
    : IQueueProducer
{
    public async Task AddClientInquiryAsync(ClientInquiry item)
    {
        var endpoint = await sendEndpointProvider.GetSendEndpoint(new Uri("queue:client-inquiry"));
        await endpoint.Send(item);
    }

    public async Task AddVolunteerInquiryAsync(VolunteerInquiry item)
    {
        var endpoint = await sendEndpointProvider.GetSendEndpoint(new Uri("queue:volunteer-inquiry"));
        await endpoint.Send(item);
    }
}