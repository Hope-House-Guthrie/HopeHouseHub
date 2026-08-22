using H3.Data;
using H3.Data.Entities;
using H3.Server.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace H3.Server.Controllers;

[ApiController]
[Route("api/kitchen/meal")]
[Authorize(Roles = "ADMIN,KITCHEN")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class MealsController(HubDbContext dbContext) : ControllerBase
{
    [HttpGet("{id}", Name = nameof(GetMealAsync))]
    [ProducesResponseType(typeof(MealResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MealResource>> GetMealAsync(string id)
    {
        var meal = await dbContext.Meals
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.Id.ToLower() == id.ToLower());

        if (meal is null)
        {
            return NotFound();
        }

        var response = new MealResource(
            meal.Items.Select(i => i.Id.ToString()).ToList(),
            meal.MealTime,
            meal.KennyismId?.ToString()
        );

        return Ok(response);
    }

    [HttpPut("{meal}", Name = nameof(UpdateMealAsync))]
    [ProducesResponseType(typeof(MealResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MealResource>> UpdateMealAsync(string meal, [FromBody] MealUpdateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var menu = await dbContext.Meals
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.Id.ToLower() == meal.ToLower());

        if (menu is null)
        {
            menu = new Meal { Id = meal.ToLower() };
            dbContext.Meals.Add(menu);
        }

        if (resource.MealTime.HasValue)
        {
            menu.MealTime = resource.MealTime.Value;
        }

        if (resource.KennyismId is not null)
        {
            menu.KennyismId = int.TryParse(resource.KennyismId, out var parsedKennyismId) ? parsedKennyismId : null;
        }

        if (resource.ItemIds is not null)
        {
            var itemIds = resource.ItemIds
                .Select(id => int.TryParse(id, out var parsedItemId) ? parsedItemId : (int?)null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            var items = await dbContext.MenuItems
                .Where(i => itemIds.Contains(i.Id))
                .ToListAsync();

            menu.Items = items;
        }

        await dbContext.SaveChangesAsync();

        var response = new MealResource(
            menu.Items.Select(i => i.Id.ToString()).ToList(),
            menu.MealTime,
            menu.KennyismId?.ToString()
        );

        return Ok(response);
    }

    [HttpDelete("{meal}", Name = nameof(DeleteMealAsync))]
    [ProducesResponseType(typeof(MealResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MealResource>> DeleteMealAsync(string meal)
    {
        var menu = await dbContext.Meals
            .Include(m => m.Items)
            .FirstOrDefaultAsync(m => m.Id.ToLower() == meal.ToLower());

        if (menu is null)
        {
            return NotFound();
        }

        menu.Items.Clear();
        menu.MealTime = default;
        menu.KennyismId = null;

        await dbContext.SaveChangesAsync();

        return Ok(new MealResource(new List<string>(), default, null));
    }
}