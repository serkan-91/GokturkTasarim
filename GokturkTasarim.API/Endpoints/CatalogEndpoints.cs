using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Gokturk.Application.Catalog.Queries;

namespace GokturkTasarim.API.Endpoints;

public static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/catalog")
            .WithTags("Catalog & Dynamic Pricing Module");

        // GET /api/catalog/categories
        group.MapGet("/categories", async (IMediator mediator) =>
        {
            var categories = await mediator.Send(new GetCategoriesQuery());
            return Results.Ok(categories);
        })
        .WithName("GetCatalogCategories")
        .WithSummary("Get Main Categories and Subcategories Hierarchy from Database");

        // GET /api/catalog/products?category=kartvizit&search=vip&page=1&pageSize=12
        group.MapGet("/products", async (IMediator mediator, string? category, string? search, int page = 1, int pageSize = 12) =>
        {
            var result = await mediator.Send(new GetProductsQuery(category, search, page, pageSize));
            return Results.Ok(result);
        })
        .WithName("GetProductsCatalog")
        .WithSummary("Get Products from DB with Stock Priority & Infinite Scroll Pagination");

        return routes;
    }
}
