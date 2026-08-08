using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetUserWishlistQuery(Guid UserId) : IRequest<List<WishlistProductDto>>;

public record WishlistProductDto(
    string ProductId,
    string Name,
    string ProductCode,
    string Category,
    decimal BasePrice,
    string? ImageUrl,
    DateTime AddedAt
);

public class GetUserWishlistQueryHandler : IRequestHandler<GetUserWishlistQuery, List<WishlistProductDto>>
{
    private readonly IGokturkDbContext _context;

    public GetUserWishlistQueryHandler(IGokturkDbContext context)
    {
        _context = context;
    }

    public async Task<List<WishlistProductDto>> Handle(GetUserWishlistQuery request, CancellationToken cancellationToken)
    {
        var wishlistItems = await _context.WishlistItems
            .Where(w => w.UserId == request.UserId)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync(cancellationToken);

        return wishlistItems.Select(w => new WishlistProductDto(
            w.ProductId,
            w.Name,
            w.ProductCode,
            w.Category,
            w.BasePrice,
            w.ImageUrl,
            w.AddedAt
        )).ToList();
    }
}
