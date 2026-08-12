using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Gokturk.Application.Catalog.Queries;
using Gokturk.Application.Catalog.Commands;

namespace GokturkTasarim.API.Endpoints;

public static class ProductGroupEndpoints
{
    public static IEndpointRouteBuilder MapProductGroupEndpoints(this IEndpointRouteBuilder routes)
    {
        // Public Catalog Product Groups
        var publicGroup = routes.MapGroup("/api/product-groups")
            .WithTags("Product Groups Module");

        // GET /api/product-groups
        // Returns active product groups with top 5 preview products for guest & customer homepages and sidebar.
        publicGroup.MapGet("/", async (IMediator mediator) =>
        {
            var groups = await mediator.Send(new GetProductGroupsQuery());
            return Results.Ok(groups);
        })
        .WithName("GetProductGroups")
        .WithSummary("Get active product groups with top 5 preview items for Homepage Amazon Widgets & Sidebar Menu");

        // GET /api/product-groups/{slugOrId}?search=bro%C5%9F%C3%BCr&page=1&pageSize=24
        // Returns single product group detail with 24-item infinite scroll pagination.
        publicGroup.MapGet("/{slugOrId}", async (IMediator mediator, string slugOrId, string? search, int page = 1, int pageSize = 24) =>
        {
            var detail = await mediator.Send(new GetProductGroupDetailQuery(slugOrId, search, page, pageSize));
            if (detail == null)
                return Results.NotFound(new { message = "Ürün grubu bulunamadı." });

            return Results.Ok(detail);
        })
        .WithName("GetProductGroupDetail")
        .WithSummary("Get dynamic product group page details with 24-item batch infinite scroll pagination");


        // Admin Product Groups Endpoints
        var adminGroup = routes.MapGroup("/api/admin/product-groups")
            .WithTags("Admin Product Groups Management");

        // GET /api/admin/product-groups
        adminGroup.MapGet("/", async (IMediator mediator) =>
        {
            var groups = await mediator.Send(new GetAllAdminProductGroupsQuery());
            return Results.Ok(groups);
        })
        .WithName("GetAdminProductGroups")
        .WithSummary("Get all product groups (active & inactive) for Admin Management");

        // POST /api/admin/product-groups
        adminGroup.MapPost("/", async (IMediator mediator, CreateProductGroupCommand command) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/product-groups/{result.Slug}", result);
        })
        .WithName("CreateProductGroup")
        .WithSummary("Create a new Product Group with selected products");

        // PUT /api/admin/product-groups/{id}
        adminGroup.MapPut("/{id:guid}", async (IMediator mediator, Guid id, UpdateProductGroupCommand command) =>
        {
            if (id != command.Id)
                return Results.BadRequest(new { message = "ID eşleşmiyor." });

            var result = await mediator.Send(command);
            if (result == null)
                return Results.NotFound(new { message = "Güncellenecek ürün grubu bulunamadı." });

            return Results.Ok(result);
        })
        .WithName("UpdateProductGroup")
        .WithSummary("Update Product Group details and product selections");

        // DELETE /api/admin/product-groups/{id}
        adminGroup.MapDelete("/{id:guid}", async (IMediator mediator, Guid id) =>
        {
            var success = await mediator.Send(new DeleteProductGroupCommand(id));
            if (!success)
                return Results.NotFound(new { message = "Silinecek ürün grubu bulunamadı." });

            return Results.Ok(new { message = "Ürün grubu başarıyla silindi." });
        })
        .WithName("DeleteProductGroup")
        .WithSummary("Delete Product Group");

        return routes;
    }
}
