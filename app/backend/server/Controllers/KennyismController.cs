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
[Route("api/kitchen/kennyism")]
[Authorize(Roles = "ADMIN,KITCHEN")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class KennyismController(HubDbContext dbContext) : ControllerBase
{
    [HttpGet(Name = nameof(ListKennyismAsync))]
    [ProducesResponseType(typeof(List<KennyismResource>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<KennyismResource>>> ListKennyismAsync()
    {
        var kennyisms = await dbContext.Kennyisms
            .Select(k => new KennyismResource(k.Id.ToString(), k.Text))
            .ToListAsync();

        return Ok(kennyisms);
    }

    [HttpGet("{id}", Name = nameof(GetKennyismAsync))]
    [ProducesResponseType(typeof(KennyismResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<KennyismResource>> GetKennyismAsync(string id)
    {
        if (!int.TryParse(id, out var parsedId))
        {
            return NotFound();
        }

        var kennyism = await dbContext.Kennyisms.FindAsync(parsedId);
        if (kennyism is null)
        {
            return NotFound();
        }

        return Ok(new KennyismResource(kennyism.Id.ToString(), kennyism.Text));
    }

    [HttpPost(Name = nameof(CreateKennyismAsync))]
    [ProducesResponseType(typeof(KennyismResource), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KennyismResource>> CreateKennyismAsync([FromBody] KennyismCreateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var kennyism = new Kennyism { Text = resource.Text };

        dbContext.Kennyisms.Add(kennyism);
        await dbContext.SaveChangesAsync();

        var response = new KennyismResource(kennyism.Id.ToString(), kennyism.Text);
        return CreatedAtRoute(nameof(GetKennyismAsync), new { id = kennyism.Id.ToString() }, response);
    }

    [HttpDelete("{id}", Name = nameof(DeleteKennyismAsync))]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteKennyismAsync(string id)
    {
        if (!int.TryParse(id, out var parsedId))
        {
            return NotFound();
        }

        var kennyism = await dbContext.Kennyisms.FindAsync(parsedId);
        if (kennyism is null)
        {
            return NotFound();
        }

        dbContext.Kennyisms.Remove(kennyism);
        await dbContext.SaveChangesAsync();

        return Ok(new { success = true, id });
    }

    [HttpGet("search", Name = nameof(SearchKennyismAsync))]
    [ProducesResponseType(typeof(List<KennyismResource>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<KennyismResource>>> SearchKennyismAsync([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new List<KennyismResource>());
        }

        var results = await dbContext.Kennyisms
            .Where(k => EF.Functions.Like(k.Text, $"%{q}%"))
            .Take(20)
            .Select(k => new KennyismResource(k.Id.ToString(), k.Text))
            .ToListAsync();

        return Ok(results);
    }
}