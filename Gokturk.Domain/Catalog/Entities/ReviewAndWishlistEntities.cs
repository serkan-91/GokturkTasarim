using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Catalog.Entities;

public class ProductReview : BaseEntity
{
    public string ProductId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; } // 1 - 5 Stars
    public string Comment { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
}

public class WishlistItem : BaseEntity
{
    public Guid UserId { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
