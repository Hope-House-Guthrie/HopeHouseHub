using H3.Queues.Consumers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace H3.Queues.Builders;

public class AzureServiceBusQueuesBuilder(IServiceCollection services, string? connectionString = null) 
    : QueuesBuilder(services)
{
    private readonly List<Action<IServiceBusBusFactoryConfigurator, IBusRegistrationContext>> _factoryRegistrations = [];
    private string? _connectionString = connectionString;

    public AzureServiceBusQueuesBuilder WithConnectionString(string connectionString)
    {
        _connectionString = connectionString;
        return this;
    }

    public override AzureServiceBusQueuesBuilder AddProducers()
    {
        base.AddProducers();
        return this;
    }

    public override AzureServiceBusQueuesBuilder AddConsumers()
    {
        base.AddConsumers();

        _factoryRegistrations.Add((factoryConfig, context) =>
        {
            factoryConfig.ReceiveEndpoint(Constants.ClientInquiryQueueName, e => e.ConfigureConsumer<ClientInquiryConsumer>(context));
            factoryConfig.ReceiveEndpoint(Constants.VolunteerInquiryQueueName, e => e.ConfigureConsumer<VolunteerInquiryConsumer>(context));
        });

        return this;
    }

    internal override void ConfigureMassTransit(IServiceCollection services)
    {
        services.AddMassTransit(x =>
        {
            foreach (var registration in BusRegistrations)
            {
                registration(x);
            }

            x.UsingAzureServiceBus((context, cfg) =>
            {
                if (!string.IsNullOrWhiteSpace(_connectionString))
                {
                    cfg.Host(_connectionString);
                }

                foreach (var factoryAction in _factoryRegistrations)
                {
                    factoryAction(cfg, context);
                }

                cfg.ConfigureEndpoints(context);
            });
        });
    }
}
