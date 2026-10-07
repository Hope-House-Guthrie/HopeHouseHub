using H3.Data.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace H3.Data.Design;

public class HubDbContextFactory : IDesignTimeDbContextFactory<HubDbContext>
{
    public HubDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<HubDbContext>();
        
        builder.AddOptions();

        return new HubDbContext(builder.Options);
    }
}