using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetProductGroupDetailQuery(
    string SlugOrId,
    string? Search = null,
    int Page = 1,
    int PageSize = 24
) : IRequest<ProductGroupDetailDto?>;

public record ProductGroupDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Icon,
    int DisplayOrder,
    PagedProductsResultDto Products
);

public class GetProductGroupDetailQueryHandler : IRequestHandler<GetProductGroupDetailQuery, ProductGroupDetailDto?>
{
    private readonly IGokturkDbContext _db;

    public GetProductGroupDetailQueryHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<ProductGroupDetailDto?> Handle(GetProductGroupDetailQuery request, CancellationToken cancellationToken)
    {
        bool isGuid = Guid.TryParse(request.SlugOrId, out var groupGuid);

        var group = await _db.ProductGroups
            .AsNoTracking()
            .Where(g => g.IsActive && (g.Slug == request.SlugOrId || (isGuid && g.Id == groupGuid)))
            .FirstOrDefaultAsync(cancellationToken);

        if (group == null)
            return null;

        var itemsQuery = _db.ProductGroupItems
            .AsNoTracking()
            .Where(i => i.ProductGroupId == group.Id && i.Product.IsActive && !i.Product.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            itemsQuery = itemsQuery.Where(i =>
                i.Product.Name.ToLower().Contains(searchLower) ||
                i.Product.ProductCode.ToLower().Contains(searchLower) ||
                i.Product.Description.ToLower().Contains(searchLower)
            );
        }

        var totalCount = await itemsQuery.CountAsync(cancellationToken);

        var items = await itemsQuery
            .OrderBy(i => i.DisplayOrder)
            .ThenByDescending(i => i.Product.StockQuantity > 0)
            .ThenBy(i => i.Product.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
            .ToListAsync(cancellationToken);

        var hasNextPage = (request.Page * request.PageSize) < totalCount;

        var pagedResult = new PagedProductsResultDto(
            items,
            totalCount,
            request.Page,
            request.PageSize,
            hasNextPage
        );

        return new ProductGroupDetailDto(
            group.Id,
            group.Name,
            group.Slug,
            group.Description,
            group.Icon,
            group.DisplayOrder,
            pagedResult
        );
    }
}
