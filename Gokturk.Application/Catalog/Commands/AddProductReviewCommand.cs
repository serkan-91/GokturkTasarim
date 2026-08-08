using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Catalog.Entities;

namespace Gokturk.Application.Catalog.Commands;

public record AddProductReviewCommand(
    string ProductId,
    Guid UserId,
    string CustomerName,
    int Rating,
    string Comment
) : IRequest<ProductReviewDto>;

public record ProductReviewDto(
    Guid Id,
    string ProductId,
    string CustomerName,
    int Rating,
    string Comment,
    DateTime CreatedAt
);

public class AddProductReviewCommandHandler : IRequestHandler<AddProductReviewCommand, ProductReviewDto>
{
    private readonly IGokturkDbContext _context;

    public AddProductReviewCommandHandler(IGokturkDbContext context)
    {
        _context = context;
    }

    public async Task<ProductReviewDto> Handle(AddProductReviewCommand request, CancellationToken cancellationToken)
    {
        var rating = Math.Clamp(request.Rating, 1, 5);

        var review = new ProductReview
        {
            ProductId = request.ProductId,
            UserId = request.UserId,
            CustomerName = string.IsNullOrWhiteSpace(request.CustomerName) ? "Müşteri" : request.CustomerName,
            Rating = rating,
            Comment = request.Comment ?? string.Empty,
            IsApproved = true
        };

        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProductReviewDto(
            review.Id,
            review.ProductId,
            review.CustomerName,
            review.Rating,
            review.Comment,
            review.CreatedAt
        );
    }
}
