using H3.Queues.Models;
using MassTransit;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace H3.Queues.Consumers;

public class VolunteerInquiryConsumer(ILogger<VolunteerInquiryConsumer> logger) 
    : IConsumer<VolunteerInquiry>
{
    public Task Consume(ConsumeContext<VolunteerInquiry> context)
    {
        var form = context.Message;
        logger.LogInformation("Received volunteer inquiry form from {FirstName} {LastName}", form.FirstName, form.LastName);

        // TODO: Validate and write VolunteerInquiryForm model data to the database here.

        return Task.CompletedTask;
    }
}