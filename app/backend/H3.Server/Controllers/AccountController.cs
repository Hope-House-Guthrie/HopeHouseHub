using H3.Data;
using H3.Data.Entities;
using H3.Server.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace H3.Server.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class AccountController(UserManager<User> userManager, HubDbContext dbContext) : ControllerBase
{
    [HttpPut("password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] AccountPasswordResource resource)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = GetCurrentUserId();
        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null)
        {
            return NotFound();
        }

        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync<IActionResult>(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();

            if (user.MustChangePassword)
            {
                var removeResult = await userManager.RemovePasswordAsync(user);
                if (!removeResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in removeResult.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }

                var addResult = await userManager.AddPasswordAsync(user, resource.NewPassword);
                if (!addResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in addResult.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }

                user.MustChangePassword = false;
                var updateResult = await userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in updateResult.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }
            }
            else
            {
                var result = await userManager.ChangePasswordAsync(
                    user, 
                    resource.CurrentPassword ?? string.Empty, 
                    resource.NewPassword);

                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }
            }

            await transaction.CommitAsync();
            return NoContent();
        });
    }

    private int GetCurrentUserId()
    {
        var nameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(nameIdentifier, out var userId) ? userId : 0;
    }
}