using H3.Queues.Events;
using H3.Queues.Models;
using MassTransit;
using System.Threading.Tasks;

namespace H3.Queues.Consumers;

public class VolunteerInquiryConsumer(IQueuesEvents events) 
    : IConsumer<VolunteerInquiry>
{
    public async Task Consume(ConsumeContext<VolunteerInquiry> context)
    {
        var form = context.Message;

        await events.PublishVolunteerInquiryAsync(form);
    }
}