using H3.Queues.Models;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;

namespace H3.Forms.Requests;

public record VolunteerInquiryRequest(VolunteerInquiry Model, string SuccessUrl)
{
    public static async ValueTask<VolunteerInquiryRequest?> BindAsync(HttpContext context)
    {
        var form = await context.Request.ReadFormAsync();

        string? firstName = GetValidString(form["firstName"], maxLength: 100);
        string? lastName = GetValidString(form["lastName"], maxLength: 100);
        string? phone = GetValidString(form["phone"], maxLength: 14);
        string? organization = GetValidString(form["organization"], maxLength: 150);
        string? availability = GetValidString(form["availability"], maxLength: 1000);
        string? message = GetValidString(form["message"], maxLength: 2000);

        var model = new VolunteerInquiry(
            SuccessUrl: form["success_url"].ToString(),
            FirstName: firstName ?? string.Empty,
            LastName: lastName ?? string.Empty,
            Email: form["email"].ToString(),
            Phone: phone,
            VolunteerType: form["volunteerType"].ToString(),
            Organization: organization,
            Interests: form["interests"].SelectMany(i => i?.Split(',') ?? []).Select(i => i.Trim()).Where(i => !string.IsNullOrEmpty(i)).ToList(),
            Availability: availability,
            Message: message
        );

        return new VolunteerInquiryRequest(model, model.SuccessUrl);
    }

    private static string? GetValidString(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        return value.Length > maxLength ? value[..maxLength] : value;
    }
}