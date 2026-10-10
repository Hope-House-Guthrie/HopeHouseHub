using H3.Queues.Models;
using H3.Queues.Events;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace H3.Server.Processors;

public class FormsProcessor(
    ILogger<FormsProcessor> logger,
    IQueuesEvents events) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        events.ClientInquiryReceived += OnClientInquiryReceived;
        events.VolunteerInquiryReceived += OnVolunteerInquiryReceived;

        var completion = new TaskCompletionSource();

        stoppingToken.Register(() =>
        {
            events.ClientInquiryReceived -= OnClientInquiryReceived;
            events.VolunteerInquiryReceived -= OnVolunteerInquiryReceived;

            completion.SetResult();
        });

        return completion.Task;
    }

    private void OnClientInquiryReceived(ClientInquiry inquiry)
    {
        logger.LogInformation("FormsProcessor handled ClientInquiry: {@Inquiry}", inquiry);
    }

    private void OnVolunteerInquiryReceived(VolunteerInquiry inquiry)
    {
        logger.LogInformation("FormsProcessor handled VolunteerInquiry: {@Inquiry}", inquiry);
    }
}