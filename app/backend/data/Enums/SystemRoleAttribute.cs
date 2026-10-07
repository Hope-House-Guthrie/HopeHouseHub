using System;

namespace H3.Data.Enums;

[AttributeUsage(AttributeTargets.Field)]
public class SystemRoleAttribute(string name, string normalizedName) : Attribute
{
    public string Name { get; } = name;
    public string NormalizedName { get; } = normalizedName;
}