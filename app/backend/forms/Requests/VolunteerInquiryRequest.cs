using H3.Queues.Messages;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace H3.Forms.Requests;

public record VolunteerInquiryRequest(VolunteerInquiry Model, string SuccessUrl)
{
    public static async ValueTask<VolunteerInquiryRequest?> BindAsync(HttpContext context)
    {
        var form = await context.Request.ReadFormAsync();

        var model = new VolunteerInquiry(
            Timestamp: DateTimeOffset.UtcNow,
            SuccessUrl: form.GetString("success_url", required: true)!,
            FirstName: form.GetString("firstName", maxLength: 100, required: true)!,
            LastName: form.GetString("lastName", maxLength: 100, required: true)!,
            Email: form.GetEmail("email", maxLength: 100, required: true)!,
            Phone: form.GetPhone("phone", required: true)!,
            VolunteerType: form.GetString("volunteerType", maxLength: 50, required: true)!,
            Organization: form.GetString("organization", maxLength: 150),
            Interests: form["interests"]
                .SelectMany(i => i?.Split(',') ?? [])
                .Select(i => i.Trim())
                .Where(i => !string.IsNullOrEmpty(i))
                .ToList(),
            Availability: form.GetString("availability", maxLength: 1000),
            Message: form.GetString("message", maxLength: 2000)
        );

        return new VolunteerInquiryRequest(model, model.SuccessUrl);
    }
}