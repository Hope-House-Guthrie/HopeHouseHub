using Microsoft.AspNetCore.Http;
using System;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace H3.Forms.Requests;

public static class FormCollectionExtensions
{
    public static string? GetString(this IFormCollection form, string key, int? maxLength = null, bool required = false)
    {        string rawValue = form[key].ToString();

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            if (required)
            {
                throw new BadHttpRequestException($"The field '{key}' is required.");
            }
            return null;
        }

        string value = rawValue.Trim();

        if (maxLength.HasValue && value.Length > maxLength.Value)
        {
            value = value[..maxLength.Value];
        }

        return value;
    }

    public static string? GetPhone(this IFormCollection form, string key, bool required = false)
    {
        string? rawValue = GetString(form, key, required: required);
        if (rawValue is null) return null;

        // Strip non-digit characters
        string digitsOnly = Regex.Replace(rawValue, @"\D", "");

        if (digitsOnly.Length != 10)
        {
            throw new BadHttpRequestException($"The field '{key}' must be a valid 10-digit phone number.");
        }

        return digitsOnly;
    }

    public static string? GetEmail(this IFormCollection form, string key, int? maxLength = 100, bool required = false)
    {
        string? value = GetString(form, key, maxLength: maxLength, required: required);
        if (value is null) return null;

        if (!MailAddress.TryCreate(value, out _))
        {
            throw new BadHttpRequestException($"The field '{key}' must be a valid email address.");
        }

        return value;
    }

    public static DateOnly? GetDate(this IFormCollection form, string key, bool required = false)
    {
        string rawValue = form[key].ToString();

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            if (required)
            {
                throw new BadHttpRequestException($"The field '{key}' is required.");
            }
            return null;
        }

        if (!DateOnly.TryParse(rawValue, out var date))
        {
            throw new BadHttpRequestException($"The field '{key}' must be a valid date.");
        }

        return date;
    }

    public static int GetInt32(this IFormCollection form, string key, int defaultValue = 0, bool required = false)
    {
        string rawValue = form[key].ToString();

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            if (required)
            {
                throw new BadHttpRequestException($"The field '{key}' is required.");
            }
            return defaultValue;
        }

        if (!int.TryParse(rawValue, out var value))
        {
            throw new BadHttpRequestException($"The field '{key}' must be a valid integer.");
        }

        return value;
    }
}