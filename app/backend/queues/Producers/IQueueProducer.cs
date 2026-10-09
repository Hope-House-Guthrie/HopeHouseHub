using H3.Queues.Models;
using System.Threading.Tasks;

namespace H3.Queues.Producers;

public interface IQueueProducer
{
    Task AddClientInquiryAsync(ClientInquiry item);
    Task AddVolunteerInquiryAsync(VolunteerInquiry item);
}