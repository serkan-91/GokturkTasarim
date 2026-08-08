using System;
using System.Collections.Generic;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Catalog.Entities;

public class CategoryEntity : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty;
    public string ParentExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

public class Product : BaseEntity, IAggregateRoot
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ExternalCategoryId { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string Unit { get; set; } = "Adet";
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
    public string? ExternalProductUrl { get; set; }

    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
    public ICollection<PriceMatrix> PriceMatrices { get; set; } = new List<PriceMatrix>();
}

public class ProductAttribute : BaseEntity
{
    public Guid ProductId { get; set; }
    public string AttributeName { get; set; } = string.Empty; // e.g. Ebat, Kağıt Tipi, Selefon
    public string AttributeValue { get; set; } = string.Empty; // e.g. A5, 350gr Kuşe, Mat Selefon
    public decimal ExtraPriceRatio { get; set; } = 1.0m;
}

public class PriceMatrix : BaseEntity
{
    public Guid ProductId { get; set; }
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class LaminationType : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Mat Selefon, Parlak Selefon, Soft Touch
    public decimal PriceMultiplier { get; set; } = 1.0m;
}
