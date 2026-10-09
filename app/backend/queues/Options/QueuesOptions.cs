namespace H3.Queues.Options;

public class QueuesOptions
{
    public const string SectionKey = "H3:Queues";

    public QueuesMode Mode { get; set; } = QueuesMode.InMemory;
    public AzureServiceBusOptions AzureServiceBus { get; set; } = new();
}
