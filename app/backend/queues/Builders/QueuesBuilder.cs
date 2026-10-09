using H3.Queues.Consumers;
using H3.Queues.Producers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace H3.Queues.Builders;

public abstract class QueuesBuilder(IServiceCollection services) : IQueuesBuilder
{
    protected readonly List<Action<IBusRegistrationConfigurator>> BusRegistrations = [];

    public IServiceCollection Services { get; } = services;

    public virtual IQueuesBuilder AddProducers()
    {
        Services.AddScoped<IQueueProducer, QueueProducer>();
        return this;
    }

    public virtual IQueuesBuilder AddConsumers()
    {
        BusRegistrations.Add(busConfig =>
        {
            busConfig.AddConsumer<ClientInquiryConsumer>();
            busConfig.AddConsumer<VolunteerInquiryConsumer>();
        });

        return this;
    }

    internal abstract void ConfigureMassTransit(IServiceCollection services);
}
