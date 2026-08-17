using H3.Data;
using H3.Data.Entities;
using H3.Data.Enums;
using H3.Data.Extensions;
using H3.Server.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace H3.Server.Controllers;

[ApiController]
[Route("api/user")]
[Authorize(Roles = "ADMIN")]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class UserController(
    UserManager<User> userManager, 
    RoleManager<Role> roleManager,
    HubDbContext dbContext) : ControllerBase
{
    private static readonly string AdminNormalizedName = 
        SystemRole.Admin.GetAttribute<SystemRoleAttribute>()?.NormalizedName ?? "ADMIN";

    [HttpGet]
    [ProducesResponseType(typeof(List<UserResource>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UserResource>>> IndexAsync()
    {
        var users = await userManager.Users
            .Where(u => u.IsActive)
            .Select(u => new UserResource(
                u.Id.ToString(),
                u.IsActive,
                u.UserName!,
                u.Email!,
                u.FirstName,
                u.LastName,
                dbContext.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(dbContext.Roles, 
                        ur => ur.RoleId, 
                        r => r.Id, 
                        (ur, r) => r.NormalizedName!)
                    .ToList(),
                null))
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUserById")]
    [ProducesResponseType(typeof(UserResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResource>> GetAsync(string id)
    {
        var user = await userManager.Users
            .Where(u => u.Id.ToString() == id)
            .Select(u => new UserResource(
                u.Id.ToString(),
                u.IsActive,
                u.UserName!,
                u.Email!,
                u.FirstName,
                u.LastName,
                dbContext.UserRoles
                    .Where(ur => ur.UserId == u.Id)
                    .Join(dbContext.Roles, 
                        ur => ur.RoleId, 
                        r => r.Id, 
                        (ur, r) => r.NormalizedName!)
                    .ToList(),
                null))
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserResource), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResource>> CreateAsync([FromBody] UserCreateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync<ActionResult<UserResource>>(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();

            var tempPassword = GenerateStrongPassword(12);
            var user = new User
            {
                UserName = resource.Email,
                Email = resource.Email,
                FirstName = resource.FirstName,
                LastName = resource.LastName,
                IsActive = true,
                MustChangePassword = true
            };

            var result = await userManager.CreateAsync(user, tempPassword);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            var assignedRoles = new List<string>();

            if (resource.RoleNormalizedNames is { Length: > 0 })
            {
                var roleResult = await SyncUserRolesAsync(user, resource.RoleNormalizedNames);
                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in roleResult.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return BadRequest(ModelState);
                }

                assignedRoles = await roleManager.Roles
                    .Where(r => resource.RoleNormalizedNames.Contains(r.NormalizedName))
                    .Select(r => r.NormalizedName!)
                    .ToListAsync();
            }

            await transaction.CommitAsync();

            var responseResource = new UserResource(
                user.Id.ToString(),
                user.IsActive,
                user.UserName,
                user.Email,
                user.FirstName,
                user.LastName,
                assignedRoles,
                TemporaryPassword: tempPassword);

            return CreatedAtRoute("GetUserById", new { id = user.Id.ToString() }, responseResource);
        });
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UserResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResource>> UpdateAsync(string id, UserUpdateResource resource)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
        if (user is null)
        {
            return NotFound();
        }

        var currentUserId = GetCurrentUserId();

        if (currentUserId.ToString() == id && !resource.IsActive)
        {
            ModelState.AddModelError("IsActive", "You cannot deactivate your own account.");
            return BadRequest(ModelState);
        }

        if (resource.RoleNormalizedNames is not null && currentUserId.ToString() == id)
        {
            var containsAdmin = resource.RoleNormalizedNames
                .Any(r => string.Equals(r, AdminNormalizedName, StringComparison.OrdinalIgnoreCase));

            if (!containsAdmin)
            {
                ModelState.AddModelError("RoleNormalizedNames", "You cannot remove the Admin role from your own account.");
                return BadRequest(ModelState);
            }
        }

        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync<ActionResult<UserResource>>(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();

            user.Email = resource.Email;
            user.UserName = resource.Email; // Keep UserName in sync with Email
            user.FirstName = resource.FirstName;
            user.LastName = resource.LastName;
            user.IsActive = resource.IsActive;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            if (resource.RoleNormalizedNames is not null)
            {
                var roleResult = await SyncUserRolesAsync(user, resource.RoleNormalizedNames);
                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    foreach (var error in roleResult.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return BadRequest(ModelState);
                }
            }

            await transaction.CommitAsync();

            // Fetch fresh role list for response entity construction
            var assignedRoles = await dbContext.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Join(dbContext.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.NormalizedName!)
                .ToListAsync();

            var responseResource = new UserResource(
                user.Id.ToString(),
                user.IsActive,
                user.UserName,
                user.Email,
                user.FirstName,
                user.LastName,
                assignedRoles,
                null);

            return Ok(responseResource);
        });
    }

    [HttpDelete("{id}/password")]
    [ProducesResponseType(typeof(UserPasswordResource), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserPasswordResource>> ResetPasswordAsync(string id)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.Id.ToString() == id);
        if (user is null)
        {
            return NotFound();
        }

        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync<ActionResult<UserPasswordResource>>(async () =>
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();

            var newPassword = GenerateStrongPassword(12);

            var removeResult = await userManager.RemovePasswordAsync(user);
            if (!removeResult.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in removeResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            var addResult = await userManager.AddPasswordAsync(user, newPassword);
            if (!addResult.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in addResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            user.MustChangePassword = true;
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                await transaction.RollbackAsync();
                foreach (var error in updateResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            await transaction.CommitAsync();
            return Ok(new UserPasswordResource(newPassword));
        });
    }

    private async Task<IdentityResult> SyncUserRolesAsync(User user, IEnumerable<string> normalizedRoleNames)
    {
        var targetNormalizedRoles = normalizedRoleNames.Distinct().ToList();

        // 1. Resolve matching target Role IDs directly from dbContext using NormalizedName
        var targetRoleIds = await dbContext.Roles
            .Where(r => targetNormalizedRoles.Contains(r.NormalizedName!))
            .Select(r => r.Id)
            .ToListAsync();

        // 2. Fetch existing UserRole junction records for this user
        var existingUserRoles = await dbContext.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .ToListAsync();

        // 3. Determine records to remove and records to add
        var rolesToRemove = existingUserRoles
            .Where(ur => !targetRoleIds.Contains(ur.RoleId))
            .ToList();

        var existingRoleIds = existingUserRoles.Select(ur => ur.RoleId).ToHashSet();
        var rolesToAdd = targetRoleIds
            .Where(roleId => !existingRoleIds.Contains(roleId))
            .Select(roleId => new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            })
            .ToList();

        // 4. Apply changes to DbContext
        if (rolesToRemove.Count > 0)
        {
            dbContext.UserRoles.RemoveRange(rolesToRemove);
        }

        if (rolesToAdd.Count > 0)
        {
            await dbContext.UserRoles.AddRangeAsync(rolesToAdd);
        }

        // Save changes within the controller transaction context
        await dbContext.SaveChangesAsync();

        return IdentityResult.Success;
    }

    private int GetCurrentUserId()
    {
        var nameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(nameIdentifier, out var userId) ? userId : 0;
    }

    private static string GenerateStrongPassword(int length)
    {
        const string upper = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string nonAlphanumeric = "!@#$%^&*()_-+=[{]};:<>|";

        var allCharSets = new[] { upper, lower, digits, nonAlphanumeric };
        var chars = new char[length];

        for (var i = 0; i < allCharSets.Length; i++)
        {
            chars[i] = allCharSets[i][RandomNumberGenerator.GetInt32(allCharSets[i].Length)];
        }

        const string validChars = upper + lower + digits + nonAlphanumeric;
        for (var i = allCharSets.Length; i < length; i++)
        {
            chars[i] = validChars[RandomNumberGenerator.GetInt32(validChars.Length)];
        }

        for (var i = chars.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars);
    }
}