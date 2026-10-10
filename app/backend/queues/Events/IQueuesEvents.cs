using System;
using System.Threading;
using System.Threading.Tasks;
using H3.Queues.Models;

namespace H3.Queues.Events;

public interface IQueuesEvents
{
    event Func<ClientInquiry, CancellationToken, Task>? ClientInquiryReceived;
    event Func<VolunteerInquiry, CancellationToken, Task>? VolunteerInquiryReceived;

    Task PublishClientInquiryAsync(ClientInquiry inquiry, CancellationToken cancellationToken = default);
    Task PublishVolunteerInquiryAsync(VolunteerInquiry inquiry, CancellationToken cancellationToken = default);
}