using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Vendor.Commands;
using Gokturk.Persistence.Contexts;

namespace GokturkTasarim.API.Endpoints;

public static class VendorEndpoints
{
    public static IEndpointRouteBuilder MapVendorEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/vendor")
            .WithTags("Vendor & XML/JSON Integration Module");

        // POST /api/vendor/sync
        group.MapPost("/sync", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new SyncVendorDataCommand());
            return Results.Ok(result);
        })
        .WithName("SyncVendorFeedData")
        .WithSummary("Synchronize Products & Categories from Promojoy XML/JSON Feeds");

        // GET /api/vendor/status
        group.MapGet("/status", async (GokturkDbContext db) =>
        {
            var lastFeed = await db.VendorFeeds
                .OrderByDescending(f => f.CreatedAt)
                .FirstOrDefaultAsync();

            var recentLogs = await db.XmlLogs
                .OrderByDescending(l => l.CreatedAt)
                .Take(10)
                .ToListAsync();

            var totalCategories = await db.Categories.CountAsync();
            var totalProducts = await db.Products.CountAsync();

            return Results.Ok(new
            {
                lastFeed,
                totalCategories,
                totalProducts,
                recentLogs
            });
        })
        .WithName("GetVendorSyncStatus");

        return routes;
    }
}
