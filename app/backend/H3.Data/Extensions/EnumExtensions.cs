using System;

namespace H3.Data.Extensions;

public static class EnumExtensions
{
    public static TAttribute? GetAttribute<TAttribute>(this Enum value) 
        where TAttribute : Attribute
    {
        var type = value.GetType();
        var name = Enum.GetName(type, value);
        if (name is null) return null;

        var field = type.GetField(name);
        return field is null 
            ? null 
            : Attribute.GetCustomAttribute(field, typeof(TAttribute)) as TAttribute;
    }
}