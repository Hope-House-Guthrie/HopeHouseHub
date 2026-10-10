using System;
using H3.Queues.Models;

namespace H3.Queues.Events;

public class QueuesEvents : IQueuesEvents
{
    public event Action<ClientInquiry>? ClientInquiryReceived;
    public event Action<VolunteerInquiry>? VolunteerInquiryReceived;

    public void PublishClientInquiry(ClientInquiry inquiry) => ClientInquiryReceived?.Invoke(inquiry);
    public void PublishVolunteerInquiry(VolunteerInquiry inquiry) => VolunteerInquiryReceived?.Invoke(inquiry);
}