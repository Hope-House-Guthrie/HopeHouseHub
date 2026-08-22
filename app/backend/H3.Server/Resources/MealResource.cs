using System;
using System.Collections.Generic;

namespace H3.Server.Resources;

public record MealResource(List<string> ItemIds, DateTimeOffset MealTime, string? KennyismId);
