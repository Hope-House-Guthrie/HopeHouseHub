using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using H3.Data;
using H3.Data.Entities;
using H3.Queues.Events;
using H3.Queues.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using ClientInquiryEntity = H3.Data.Entities.ClientInquiry;
using ClientInquiryMessage = H3.Queues.Models.ClientInquiry;
using VolunteerInquiryEntity = H3.Data.Entities.VolunteerInquiry;
using VolunteerInquiryMessage = H3.Queues.Models.VolunteerInquiry;

namespace H3.Server.Processors;

public class FormsProcessor(
    IServiceScopeFactory scopeFactory,
    ILogger<FormsProcessor> logger,
    IQueuesEvents events) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        events.ClientInquiryReceived += ProcessClientInquiryAsync;
        events.VolunteerInquiryReceived += ProcessVolunteerInquiryAsync;

        var completion = new TaskCompletionSource();

        stoppingToken.Register(() =>
        {
            events.ClientInquiryReceived -= ProcessClientInquiryAsync;
            events.VolunteerInquiryReceived -= ProcessVolunteerInquiryAsync;

            completion.SetResult();
        });

        return completion.Task;
    }

    private async Task ProcessClientInquiryAsync(ClientInquiryMessage message, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HubDbContext>();

            var entity = new ClientInquiryEntity
            {
                FirstName = message.FirstName,
                MiddleName = message.MiddleName,
                LastName = message.LastName,
                Suffix = message.Suffix,
                DateOfBirth = message.DateOfBirth,
                Phone = message.Phone,
                Email = message.Email,
                ContactMethod = message.ContactMethod,
                HouseholdType = message.HouseholdType,
                Children = message.Children,
                ShelterTiming = message.ShelterTiming,
                VaccinationWillingness = message.VaccinationWillingness,
                Message = message.Message,
                Timestamp = message.Timestamp
            };

            dbContext.ClientInquiries.Add(entity);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Processing ClientInquiry was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving ClientInquiry to database.");
            throw;
        }
    }

    private async Task ProcessVolunteerInquiryAsync(VolunteerInquiryMessage inquiry, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<HubDbContext>();

            var entity = new VolunteerInquiryEntity
            {
                FirstName = inquiry.FirstName,
                LastName = inquiry.LastName,
                Email = inquiry.Email,
                Phone = inquiry.Phone,
                VolunteerType = inquiry.VolunteerType,
                Organization = inquiry.Organization,
                Interests = inquiry.Interests?.ToList() ?? [],
                Availability = inquiry.Availability,
                Message = inquiry.Message,
                Timestamp = inquiry.Timestamp
            };

            dbContext.VolunteerInquiries.Add(entity);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Processing VolunteerInquiry was canceled.");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving VolunteerInquiry to database.");
            throw;
        }
    }
}