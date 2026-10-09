using H3.Queues.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace H3.Forms.Requests;

public record ClientInquiryRequest(ClientInquiry Model, string SuccessUrl)
{
    public static async ValueTask<ClientInquiryRequest?> BindAsync(HttpContext context)
    {
        var form = await context.Request.ReadFormAsync();

        string? firstName = GetValidString(form["firstName"], maxLength: 100);
        string? middleName = GetValidString(form["middleName"], maxLength: 100);
        string? lastName = GetValidString(form["lastName"], maxLength: 100);
        string? phone = GetValidString(form["phone"], maxLength: 14);
        string? message = GetValidString(form["message"], maxLength: 2000);

        var model = new ClientInquiry(
            SuccessUrl: form["success_url"].ToString(),
            FirstName: firstName ?? string.Empty,
            MiddleName: middleName,
            LastName: lastName ?? string.Empty,
            Suffix: form["suffix"].ToString(),
            DateOfBirth: DateOnly.TryParse(form["dateOfBirth"], out var dob) ? dob : null,
            Phone: phone,
            Email: form["email"].ToString(),
            ContactMethod: form["contactMethod"].ToString(),
            HouseholdType: form["householdType"].ToString(),
            Children: int.TryParse(form["children"], out var c) ? c : 0,
            ShelterTiming: form["shelterTiming"].ToString(),
            VaccinationWillingness: form["vaccinationWillingness"].ToString(),
            Message: message
        );

        return new ClientInquiryRequest(model, model.SuccessUrl);
    }

    private static string? GetValidString(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        
        return value.Length > maxLength ? value[..maxLength] : value;
    }
}