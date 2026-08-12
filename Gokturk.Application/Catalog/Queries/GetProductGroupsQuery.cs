using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetProductGroupsQuery : IRequest<List<ProductGroupPreviewDto>>;

public record ProductGroupPreviewDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Icon,
    int DisplayOrder,
    int TotalProductsCount,
    List<ProductDto> PreviewProducts
);

public class GetProductGroupsQueryHandler : IRequestHandler<GetProductGroupsQuery, List<ProductGroupPreviewDto>>
{
    private readonly IGokturkDbContext _db;

    public GetProductGroupsQueryHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProductGroupPreviewDto>> Handle(GetProductGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _db.ProductGroups
            .AsNoTracking()
            .Where(g => g.IsActive)
            .OrderBy(g => g.DisplayOrder)
            .ThenBy(g => g.Name)
            .Include(g => g.Items)
                .ThenInclude(i => i.Product)
            .ToListAsync(cancellationToken);

        var fallbackProducts = await _db.Products
            .AsNoTracking()
            .Where(p => !p.IsDeleted)
            .Take(10)
            .ToListAsync(cancellationToken);

        var result = new List<ProductGroupPreviewDto>();

        foreach (var g in groups)
        {
            var activeItems = g.Items
                .Where(i => i.Product != null && !i.Product.IsDeleted)
                .OrderBy(i => i.DisplayOrder)
                .ToList();

            var previewProducts = activeItems
                .Take(4)
                .Select(i => new ProductDto(
                    i.Product.Id,
                    i.Product.ProductCode,
                    i.Product.Name,
                    i.Product.Slug,
                    i.Product.Category,
                    i.Product.ExternalCategoryId,
                    i.Product.BasePrice,
                    i.Product.Unit,
                    i.Product.StockQuantity,
                    i.Product.StockQuantity > 0,
                    i.Product.Description,
                    i.Product.ImageUrl,
                    i.Product.ExternalProductUrl
                ))
                .ToList();

            if (previewProducts.Count < 4 && fallbackProducts.Count > 0)
            {
                var existingIds = new HashSet<Guid>(previewProducts.Select(p => p.Id));
                foreach (var fp in fallbackProducts)
                {
                    if (previewProducts.Count >= 4) break;
                    if (!existingIds.Contains(fp.Id))
                    {
                        previewProducts.Add(new ProductDto(
                            fp.Id, fp.ProductCode, fp.Name, fp.Slug, fp.Category,
                            fp.ExternalCategoryId, fp.BasePrice, fp.Unit, fp.StockQuantity,
                            fp.StockQuantity > 0, fp.Description, fp.ImageUrl, fp.ExternalProductUrl
                        ));
                        existingIds.Add(fp.Id);
                    }
                }
            }

            result.Add(new ProductGroupPreviewDto(
                g.Id,
                g.Name,
                g.Slug,
                g.Description,
                g.Icon,
                g.DisplayOrder,
                g.Items.Count > 0 ? g.Items.Count : activeItems.Count,
                previewProducts
            ));
        }

        return result;
    }
}
