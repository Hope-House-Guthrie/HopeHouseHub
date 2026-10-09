using H3.Queues.Consumers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace H3.Queues.Builders;

public class InMemoryQueuesBuilder(IServiceCollection services) : QueuesBuilder(services)
{
    private readonly List<Action<IInMemoryBusFactoryConfigurator, IBusRegistrationContext>> _factoryRegistrations = [];

    public override InMemoryQueuesBuilder AddProducers()
    {
        base.AddProducers();
        return this;
    }

    public override InMemoryQueuesBuilder AddConsumers()
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

            x.UsingInMemory((context, cfg) =>
            {
                foreach (var factoryAction in _factoryRegistrations)
                {
                    factoryAction(cfg, context);
                }

                cfg.ConfigureEndpoints(context);
            });
        });
    }
}
