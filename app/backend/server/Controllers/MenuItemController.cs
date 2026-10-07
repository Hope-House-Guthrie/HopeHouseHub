// MenuItemsController.cs
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
[Route("api/kitchen/menu-item")]
[Authorize(Roles = "ADMIN,KITCHEN")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class MenuItemsController(HubDbContext dbContext) : ControllerBase
{
    [HttpGet(Name = nameof(ListMenuItemAsync))]
    [ProducesResponseType(typeof(List<MenuItemResource>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<MenuItemResource>>> ListMenuItemAsync()
    {
        var items = await dbContext.MenuItems
            .Select(m => new MenuItemResource(m.Id.ToString(), m.Name, m.Category))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}", Name = nameof(GetMenuItemAsync))]
    [ProducesResponseType(typeof(MenuItemResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MenuItemResource>> GetMenuItemAsync(string id)
    {
        if (!int.TryParse(id, out var parsedId))
        {
            return NotFound();
        }

        var menuItem = await dbContext.MenuItems.FindAsync(parsedId);
        if (menuItem is null)
        {
            return NotFound();
        }

        return Ok(new MenuItemResource(menuItem.Id.ToString(), menuItem.Name, menuItem.Category));
    }

    [HttpPost(Name = nameof(CreateMenuItemAsync))]
    [ProducesResponseType(typeof(MenuItemResource), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MenuItemResource>> CreateMenuItemAsync([FromBody] MenuItemCreateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var menuItem = new MenuItem
        {
            Name = resource.Name,
            Category = resource.Category
        };

        dbContext.MenuItems.Add(menuItem);
        await dbContext.SaveChangesAsync();

        var response = new MenuItemResource(menuItem.Id.ToString(), menuItem.Name, menuItem.Category);
        return CreatedAtRoute(nameof(GetMenuItemAsync), new { id = menuItem.Id.ToString() }, response);
    }

    [HttpPatch("{id}", Name = nameof(UpdateMenuItemAsync))]
    [ProducesResponseType(typeof(MenuItemResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MenuItemResource>> UpdateMenuItemAsync(string id, [FromBody] MenuItemUpdateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!int.TryParse(id, out var parsedId))
        {
            return NotFound();
        }

        var menuItem = await dbContext.MenuItems.FindAsync(parsedId);
        if (menuItem is null)
        {
            return NotFound();
        }

        if (resource.Name is not null) menuItem.Name = resource.Name;
        if (resource.Category is not null) menuItem.Category = resource.Category;

        await dbContext.SaveChangesAsync();

        return Ok(new MenuItemResource(menuItem.Id.ToString(), menuItem.Name, menuItem.Category));
    }

    [HttpDelete("{id}", Name = nameof(DeleteMenuItemAsync))]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMenuItemAsync(string id)
    {
        if (!int.TryParse(id, out var parsedId))
        {
            return NotFound();
        }

        var menuItem = await dbContext.MenuItems.FindAsync(parsedId);
        if (menuItem is null)
        {
            return NotFound();
        }

        dbContext.MenuItems.Remove(menuItem);
        await dbContext.SaveChangesAsync();

        return Ok(new { success = true, id });
    }

    [HttpGet("search", Name = nameof(SearchMenuItemAsync))]
    [ProducesResponseType(typeof(List<MenuItemResource>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<MenuItemResource>>> SearchMenuItemAsync([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new List<MenuItemResource>());
        }

        var results = await dbContext.MenuItems
            .Where(m => EF.Functions.Like(m.Name, $"%{q}%"))
            .Take(20)
            .Select(m => new MenuItemResource(m.Id.ToString(), m.Name, m.Category))
            .ToListAsync();

        return Ok(results);
    }
}