using H3.Queues.Models;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace H3.Queues.Consumers;

public class ClientInquiryConsumer(ILogger<ClientInquiryConsumer> logger) 
    : IConsumer<ClientInquiry>
{
    public Task Consume(ConsumeContext<ClientInquiry> context)
    {
        var form = context.Message;
        logger.LogInformation("Received client inquiry form from {FirstName} {LastName}", form.FirstName, form.LastName);

        // TODO: Validate and write ClientInquiryForm model data to the database here.

        return Task.CompletedTask;
    }
}