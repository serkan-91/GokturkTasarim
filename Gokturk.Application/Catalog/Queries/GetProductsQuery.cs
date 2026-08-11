using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetProductsQuery(
    string? Category = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 12
) : IRequest<PagedProductsResultDto>;

public record ProductDto(
    Guid Id,
    string ProductCode,
    string Name,
    string Slug,
    string Category,
    string ExternalCategoryId,
    decimal BasePrice,
    string Unit,
    int StockQuantity,
    bool InStock,
    string Description,
    string? ImageUrl,
    string? ExternalProductUrl
);

public record PagedProductsResultDto(
    List<ProductDto> Items,
    int TotalCount,
    int Page,
    int PageSize,
    bool HasNextPage
);

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedProductsResultDto>
{
    private readonly IGokturkDbContext _db;

    public GetProductsQueryHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<PagedProductsResultDto> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Products
            .AsNoTracking()
            .Where(p => p.IsActive);

        // Filter by Category (Category & Subcategory Matching)
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var catTerm = request.Category.Trim();

            // Find all matching category entities (by ExternalId, ParentExternalId, Slug, Name, or Id)
            var matchedCategories = await _db.Categories
                .AsNoTracking()
                .Where(c => c.ExternalId == catTerm || 
                            c.ParentExternalId == catTerm || 
                            c.Slug == catTerm || 
                            c.Name == catTerm ||
                            c.Id.ToString() == catTerm)
                .ToListAsync(cancellationToken);

            var categoryIds = matchedCategories.Select(c => c.ExternalId).Where(id => !string.IsNullOrEmpty(id)).ToList();
            var categoryNames = matchedCategories.Select(c => c.Name.ToLower()).Where(n => !string.IsNullOrEmpty(n)).ToList();

            // Also find subcategories if catTerm is a main category
            var subCategoryIds = await _db.Categories
                .AsNoTracking()
                .Where(c => categoryIds.Contains(c.ParentExternalId))
                .Select(c => c.ExternalId)
                .ToListAsync(cancellationToken);

            categoryIds.AddRange(subCategoryIds);
            if (!categoryIds.Contains(catTerm))
            {
                categoryIds.Add(catTerm);
            }

            var catTermLower = catTerm.ToLower();

            query = query.Where(p =>
                categoryIds.Contains(p.ExternalCategoryId) ||
                p.ExternalCategoryId == catTerm ||
                categoryNames.Contains(p.Category.ToLower()) ||
                p.Category.ToLower() == catTermLower ||
                p.Category.ToLower().Contains(catTermLower)
            );
        }

        // Filter by Search Keyword if specified
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.ProductCode.ToLower().Contains(searchTerm) ||
                p.Description.ToLower().Contains(searchTerm)
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Algorithmic Stock Priority Sorting: In-stock items (StockQuantity > 0) FIRST!
        var pagedItems = await query
            .OrderByDescending(p => p.StockQuantity > 0) // In-Stock Priority
            .ThenByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductDto(
                p.Id,
                p.ProductCode,
                p.Name,
                p.Slug,
                p.Category,
                p.ExternalCategoryId,
                p.BasePrice,
                p.Unit,
                p.StockQuantity,
                p.StockQuantity > 0,
                p.Description,
                p.ImageUrl,
                p.ExternalProductUrl
            ))
            .ToListAsync(cancellationToken);

        var hasNextPage = (request.Page * request.PageSize) < totalCount;

        return new PagedProductsResultDto(
            pagedItems,
            totalCount,
            request.Page,
            request.PageSize,
            hasNextPage
        );
    }
}
