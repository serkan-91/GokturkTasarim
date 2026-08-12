using System;
using System.Collections.Generic;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Catalog.Entities;

public class ProductGroup : BaseEntity, IAggregateRoot
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "fa-solid fa-layer-group";
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<ProductGroupItem> Items { get; set; } = new List<ProductGroupItem>();
}

public class ProductGroupItem : BaseEntity
{
    public Guid ProductGroupId { get; set; }
    public ProductGroup ProductGroup { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int DisplayOrder { get; set; } = 0;
}
