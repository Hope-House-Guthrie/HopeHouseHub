using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using H3.Queues.Builders;
using H3.Queues.Options;
using System;

namespace H3.Queues.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddQueues(
        this IServiceCollection services, 
        Action<QueuesConfigurator> configure)
    {
        var configurator = new QueuesConfigurator(services);
        configure(configurator);

        if (configurator.ActiveBuilder is null)
        {
            throw new InvalidOperationException(
                $"A transport must be selected using {nameof(QueuesConfigurator.UsingInMemory)}(), {nameof(QueuesConfigurator.UsingAzureServiceBus)}(), or {nameof(QueuesConfigurator.UsingRabbitMQ)}().");
        }

        configurator.ActiveBuilder.ConfigureMassTransit(services);

        return services;
    }

    public static IServiceCollection AddQueues(
        this IServiceCollection services, 
        IConfiguration configuration, 
        Action<IQueuesBuilder>? configure = null)
    {
        services.Configure<QueuesOptions>(configuration.GetSection(QueuesOptions.SectionKey));
        
        var options = configuration
            .GetSection(QueuesOptions.SectionKey)
            .Get<QueuesOptions>() ?? new QueuesOptions();

        return services.AddQueues(configurator =>
        {
            IQueuesBuilder builder = options.Mode switch
            {
                QueuesMode.RabbitMQ => configurator.UsingRabbitMQ(),
                QueuesMode.AzureServiceBus => configurator.UsingAzureServiceBus(options.AzureServiceBus.ConnectionString),
                QueuesMode.InMemory => configurator.UsingInMemory(),
                _ => throw new ArgumentOutOfRangeException(nameof(options.Mode), $"Unsupported {nameof(QueuesOptions.Mode)}: {options.Mode}")
            };

            configure?.Invoke(builder);
        });
    }
}