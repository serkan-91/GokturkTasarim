using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Catalog.Commands;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Application.Catalog.Queries;

public record GetProductReviewsQuery(string ProductId) : IRequest<ProductReviewSummaryDto>;

public record ProductReviewSummaryDto(
    string ProductId,
    double AverageRating,
    int TotalReviews,
    List<ProductReviewDto> Reviews
);

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, ProductReviewSummaryDto>
{
    private readonly IGokturkDbContext _context;

    public GetProductReviewsQueryHandler(IGokturkDbContext context)
    {
        _context = context;
    }

    public async Task<ProductReviewSummaryDto> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _context.ProductReviews
            .Where(r => r.ProductId == request.ProductId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var total = reviews.Count;
        var avg = total > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

        var reviewDtos = reviews.Select(r => new ProductReviewDto(
            r.Id,
            r.ProductId,
            r.CustomerName,
            r.Rating,
            r.Comment,
            r.CreatedAt
        )).ToList();

        return new ProductReviewSummaryDto(request.ProductId, avg, total, reviewDtos);
    }
}
