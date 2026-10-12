using H3.Queues.Messages;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace H3.Forms.Requests;

public record ClientInquiryRequest(ClientInquiry Model, string SuccessUrl)
{
    public static async ValueTask<ClientInquiryRequest?> BindAsync(HttpContext context)
    {
        var form = await context.Request.ReadFormAsync();

        var model = new ClientInquiry(
            Timestamp: DateTimeOffset.UtcNow,
            SuccessUrl: form.GetString("success_url", required: true)!,
            FirstName: form.GetString("firstName", maxLength: 100, required: true)!,
            MiddleName: form.GetString("middleName", maxLength: 100),
            LastName: form.GetString("lastName", maxLength: 100, required: true)!,
            Suffix: form.GetString("suffix", maxLength: 5),
            DateOfBirth: form.GetDate("dateOfBirth", required: true)!.Value,
            Phone: form.GetPhone("phone", required: true)!,
            Email: form.GetEmail("email", maxLength: 100, required: true)!,
            ContactMethod: form.GetString("contactMethod", maxLength: 15, required: true)!,
            HouseholdType: form.GetString("householdType", maxLength: 15, required: true)!,
            Children: form.GetInt32("children", defaultValue: 0),
            ShelterTiming: form.GetString("shelterTiming", maxLength: 50, required: true)!,
            VaccinationWillingness: form.GetString("vaccinationWillingness", maxLength: 50, required: true)!,
            Message: form.GetString("message", maxLength: 2000)
        );

        return new ClientInquiryRequest(model, model.SuccessUrl);
    }
}