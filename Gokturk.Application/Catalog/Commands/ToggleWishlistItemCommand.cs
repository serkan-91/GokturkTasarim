using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Catalog.Entities;

namespace Gokturk.Application.Catalog.Commands;

public record ToggleWishlistItemCommand(
    Guid UserId,
    string ProductId,
    string? Name = null,
    string? ProductCode = null,
    string? Category = null,
    decimal? BasePrice = null,
    string? ImageUrl = null
) : IRequest<ToggleWishlistResultDto>;

public record ToggleWishlistResultDto(
    string ProductId,
    bool IsInWishlist,
    string Message
);

public class ToggleWishlistItemCommandHandler : IRequestHandler<ToggleWishlistItemCommand, ToggleWishlistResultDto>
{
    private readonly IGokturkDbContext _context;

    public ToggleWishlistItemCommandHandler(IGokturkDbContext context)
    {
        _context = context;
    }

    public async Task<ToggleWishlistResultDto> Handle(ToggleWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ProductId == request.ProductId, cancellationToken);

        if (existing != null)
        {
            _context.WishlistItems.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return new ToggleWishlistResultDto(request.ProductId, false, "Ürün favorilerden çıkarıldı.");
        }
        else
        {
            var newItem = new WishlistItem
            {
                UserId = request.UserId,
                ProductId = request.ProductId,
                Name = request.Name ?? request.ProductId,
                ProductCode = request.ProductCode ?? request.ProductId,
                Category = request.Category ?? "Genel",
                BasePrice = request.BasePrice ?? 0,
                ImageUrl = request.ImageUrl,
                AddedAt = DateTime.UtcNow
            };
            _context.WishlistItems.Add(newItem);
            await _context.SaveChangesAsync(cancellationToken);
            return new ToggleWishlistResultDto(request.ProductId, true, "Ürün favorilere eklendi.");
        }
    }
}
