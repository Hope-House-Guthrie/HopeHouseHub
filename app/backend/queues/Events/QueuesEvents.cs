using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using H3.Queues.Models;

namespace H3.Queues.Events;

public class QueuesEvents : IQueuesEvents
{
    public event Func<ClientInquiry, CancellationToken, Task>? ClientInquiryReceived;
    public event Func<VolunteerInquiry, CancellationToken, Task>? VolunteerInquiryReceived;

    public async Task PublishClientInquiryAsync(ClientInquiry inquiry, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var handlers = ClientInquiryReceived;
        if (handlers is null) return;

        var tasks = handlers
            .GetInvocationList()
            .Cast<Func<ClientInquiry, CancellationToken, Task>>()
            .Select(handler => handler(inquiry, cancellationToken));

        await Task.WhenAll(tasks);
    }

    public async Task PublishVolunteerInquiryAsync(VolunteerInquiry inquiry, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var handlers = VolunteerInquiryReceived;
        if (handlers is null) return;

        var tasks = handlers
            .GetInvocationList()
            .Cast<Func<VolunteerInquiry, CancellationToken, Task>>()
            .Select(handler => handler(inquiry, cancellationToken));

        await Task.WhenAll(tasks);
    }
}