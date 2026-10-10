using H3.Queues.Events;
using H3.Queues.Models;
using MassTransit;
using System.Threading.Tasks;

namespace H3.Queues.Consumers;

public class ClientInquiryConsumer(IQueuesEvents events) 
    : IConsumer<ClientInquiry>
{
    public Task Consume(ConsumeContext<ClientInquiry> context)
    {
        var form = context.Message;

        events.PublishClientInquiry(form);

        return Task.CompletedTask;
    }
}