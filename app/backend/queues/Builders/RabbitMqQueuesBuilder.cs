using H3.Queues.Consumers;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;

namespace H3.Queues.Builders;

public class RabbitMqQueuesBuilder(IServiceCollection services) : QueuesBuilder(services)
{
    private readonly List<Action<IRabbitMqBusFactoryConfigurator, IBusRegistrationContext>> _factoryRegistrations = [];
    private string _host = "localhost";
    private string _virtualHost = "/";
    private string _username = "guest";
    private string _password = "guest";

    public RabbitMqQueuesBuilder Host(string host, string virtualHost)
    {
        _host = host;
        _virtualHost = virtualHost;
        return this;
    }

    public RabbitMqQueuesBuilder Credentials(string username, string password)
    {
        _username = username;
        _password = password;
        return this;
    }

    public override RabbitMqQueuesBuilder AddProducers()
    {
        base.AddProducers();
        return this;
    }

    public override RabbitMqQueuesBuilder AddConsumers()
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

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(_host, _virtualHost, h =>
                {
                    h.Username(_username);
                    h.Password(_password);
                });

                foreach (var factoryAction in _factoryRegistrations)
                {
                    factoryAction(cfg, context);
                }

                cfg.ConfigureEndpoints(context);
            });
        });
    }
}
