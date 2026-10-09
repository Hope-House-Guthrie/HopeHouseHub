using H3.Queues.Builders;
using Microsoft.Extensions.DependencyInjection;

namespace H3.Queues.Extensions;

public class QueuesConfigurator(IServiceCollection services)
{
    public IServiceCollection Services { get; } = services;
    internal QueuesBuilder? ActiveBuilder { get; private set; }

    public InMemoryQueuesBuilder UsingInMemory()
    {
        var builder = new InMemoryQueuesBuilder(Services);
        ActiveBuilder = builder;
        return builder;
    }

    public AzureServiceBusQueuesBuilder UsingAzureServiceBus(string? connectionString = null)
    {
        var builder = new AzureServiceBusQueuesBuilder(Services, connectionString);
        ActiveBuilder = builder;
        return builder;
    }

    public RabbitMqQueuesBuilder UsingRabbitMQ()
    {
        var builder = new RabbitMqQueuesBuilder(Services);
        ActiveBuilder = builder;
        return builder;
    }
}
