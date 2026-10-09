using Microsoft.Extensions.DependencyInjection;

namespace H3.Queues.Builders;

public interface IQueuesBuilder
{
    IServiceCollection Services { get; }
    IQueuesBuilder AddProducers();
    IQueuesBuilder AddConsumers();
}
