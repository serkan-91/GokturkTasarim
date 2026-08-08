using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Gokturk.Application.Catalog.Commands;
using Gokturk.Application.Catalog.Queries;

namespace GokturkTasarim.API.Endpoints;

public static class CustomerInteractionEndpoints
{
    public static IEndpointRouteBuilder MapCustomerInteractionEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/customer/interaction")
            .WithTags("Customer Reviews & Wishlist Module");

        // 1. GET /api/customer/interaction/products/{productId}/reviews
        group.MapGet("/products/{productId}/reviews", async (string productId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetProductReviewsQuery(productId));
            return Results.Ok(result);
        })
        .WithName("GetProductReviews")
        .WithSummary("Get Customer Reviews & Average Rating for a Product");

        // 2. POST /api/customer/interaction/products/{productId}/reviews
        group.MapPost("/products/{productId}/reviews", async (string productId, AddReviewRequest request, HttpContext http, IMediator mediator) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = !string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedGuid)
                ? parsedGuid
                : Guid.NewGuid();

            var nameClaim = http.User.FindFirst(ClaimTypes.Name)?.Value ?? request.CustomerName ?? "Değerli Müşterimiz";

            var command = new AddProductReviewCommand(
                productId,
                userId,
                nameClaim,
                request.Rating,
                request.Comment
            );

            var review = await mediator.Send(command);
            return Results.Ok(review);
        })
        .WithName("AddProductReview")
        .WithSummary("Submit a Customer Product Review and Rating (1-5 Stars)");

        // 3. GET /api/customer/interaction/wishlist
        group.MapGet("/wishlist", async (HttpContext http, IMediator mediator) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = !string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedGuid)
                ? parsedGuid
                : Guid.Parse("11111111-1111-1111-1111-111111111111");

            var wishlist = await mediator.Send(new GetUserWishlistQuery(userId));
            return Results.Ok(wishlist);
        })
        .WithName("GetUserWishlist")
        .WithSummary("Get Favorite Products in Customer Wishlist");

        // 4. POST /api/customer/interaction/wishlist/toggle/{productId}
        group.MapPost("/wishlist/toggle/{productId}", async (string productId, ToggleWishlistRequest? request, HttpContext http, IMediator mediator) =>
        {
            var userIdClaim = http.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = !string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedGuid)
                ? parsedGuid
                : Guid.Parse("11111111-1111-1111-1111-111111111111");

            var command = new ToggleWishlistItemCommand(
                userId,
                productId,
                request?.Name,
                request?.ProductCode,
                request?.Category,
                request?.BasePrice,
                request?.ImageUrl
            );

            var result = await mediator.Send(command);
            return Results.Ok(result);
        })
        .WithName("ToggleWishlistItem")
        .WithSummary("Add or Remove Product from Customer Favorites Wishlist");

        return routes;
    }
}

public record AddReviewRequest(string? CustomerName, int Rating, string Comment);
public record ToggleWishlistRequest(string? Name, string? ProductCode, string? Category, decimal? BasePrice, string? ImageUrl);
