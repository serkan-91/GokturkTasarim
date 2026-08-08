using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetCategoriesQuery() : IRequest<List<CategoryTreeNodeDto>>;

public record SubCategoryNodeDto(
    Guid Id,
    string ExternalId,
    string Name,
    string Slug,
    int ProductCount
);

public record CategoryTreeNodeDto(
    Guid Id,
    string ExternalId,
    string Name,
    string Slug,
    int TotalProductCount,
    List<SubCategoryNodeDto> SubCategories
);

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryTreeNodeDto>>
{
    private readonly IGokturkDbContext _db;

    public GetCategoriesQueryHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryTreeNodeDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var allCategories = await _db.Categories
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var productCounts = await _db.Products
            .AsNoTracking()
            .GroupBy(p => p.ExternalCategoryId)
            .Select(g => new { ExternalCatId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ExternalCatId, x => x.Count, cancellationToken);

        // Group into main categories (ParentExternalId == "0" or empty)
        var mainCategories = allCategories
            .Where(c => c.ParentExternalId == "0" || string.IsNullOrEmpty(c.ParentExternalId))
            .OrderBy(c => c.Name)
            .ToList();

        var result = new List<CategoryTreeNodeDto>();

        foreach (var main in mainCategories)
        {
            var subs = allCategories
                .Where(c => c.ParentExternalId == main.ExternalId)
                .OrderBy(c => c.Name)
                .Select(s => new SubCategoryNodeDto(
                    s.Id,
                    s.ExternalId,
                    s.Name,
                    s.Slug,
                    productCounts.TryGetValue(s.ExternalId, out var subCount) ? subCount : 0
                ))
                .ToList();

            var directCount = productCounts.TryGetValue(main.ExternalId, out var mCount) ? mCount : 0;
            var subTotalCount = subs.Sum(s => s.ProductCount);

            result.Add(new CategoryTreeNodeDto(
                main.Id,
                main.ExternalId,
                main.Name,
                main.Slug,
                directCount + subTotalCount,
                subs
            ));
        }

        return result;
    }
}
