using System;
using H3.Queues.Models;

namespace H3.Queues.Events;

public interface IQueuesEvents
{
    event Action<ClientInquiry>? ClientInquiryReceived;
    event Action<VolunteerInquiry>? VolunteerInquiryReceived;

    void PublishClientInquiry(ClientInquiry inquiry);
    void PublishVolunteerInquiry(VolunteerInquiry inquiry);
}
