using System;
using System.Collections.Generic;

namespace H3.Data.Entities;

public class Meal
{
    public string Id { get; set; } = string.Empty;
    public DateTimeOffset MealTime { get; set; }
    public int? KennyismId { get; set; }
    public Kennyism? Kennyism { get; set; }
    public List<MenuItem> Items { get; set; } = new();
}