using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Catalog.Entities;

namespace Gokturk.Application.Catalog.Commands;

// Admin DTO for Group with all product IDs
public record AdminProductGroupDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Icon,
    int DisplayOrder,
    bool IsActive,
    DateTime CreatedAt,
    List<Guid> ProductIds,
    int ProductCount
);

// 1. Get All Groups for Admin
public record GetAllAdminProductGroupsQuery : IRequest<List<AdminProductGroupDto>>;

public class GetAllAdminProductGroupsQueryHandler : IRequestHandler<GetAllAdminProductGroupsQuery, List<AdminProductGroupDto>>
{
    private readonly IGokturkDbContext _db;

    public GetAllAdminProductGroupsQueryHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<List<AdminProductGroupDto>> Handle(GetAllAdminProductGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _db.ProductGroups
            .AsNoTracking()
            .OrderBy(g => g.DisplayOrder)
            .ThenByDescending(g => g.CreatedAt)
            .Include(g => g.Items.OrderBy(i => i.DisplayOrder))
            .ToListAsync(cancellationToken);

        return groups.Select(g => new AdminProductGroupDto(
            g.Id,
            g.Name,
            g.Slug,
            g.Description,
            g.Icon,
            g.DisplayOrder,
            g.IsActive,
            g.CreatedAt,
            g.Items.Select(i => i.ProductId).ToList(),
            g.Items.Count
        )).ToList();
    }
}

// 2. Create Group Command
public record CreateProductGroupCommand(
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    int DisplayOrder,
    bool IsActive,
    List<Guid> ProductIds
) : IRequest<AdminProductGroupDto>;

public class CreateProductGroupCommandHandler : IRequestHandler<CreateProductGroupCommand, AdminProductGroupDto>
{
    private readonly IGokturkDbContext _db;

    public CreateProductGroupCommandHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<AdminProductGroupDto> Handle(CreateProductGroupCommand request, CancellationToken cancellationToken)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.Name)
            : GenerateSlug(request.Slug);

        // Ensure unique slug
        int counter = 1;
        var originalSlug = slug;
        while (await _db.ProductGroups.AnyAsync(g => g.Slug == slug, cancellationToken))
        {
            slug = $"{originalSlug}-{counter++}";
        }

        var group = new ProductGroup
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "fa-solid fa-layer-group" : request.Icon.Trim(),
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive
        };

        if (request.ProductIds != null && request.ProductIds.Count > 0)
        {
            int order = 1;
            foreach (var pid in request.ProductIds.Distinct())
            {
                group.Items.Add(new ProductGroupItem
                {
                    ProductId = pid,
                    DisplayOrder = order++
                });
            }
        }

        await _db.ProductGroups.AddAsync(group, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new AdminProductGroupDto(
            group.Id,
            group.Name,
            group.Slug,
            group.Description,
            group.Icon,
            group.DisplayOrder,
            group.IsActive,
            group.CreatedAt,
            group.Items.Select(i => i.ProductId).ToList(),
            group.Items.Count
        );
    }

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "grup-" + Guid.NewGuid().ToString("N")[..6];
        var s = text.ToLowerInvariant().Trim()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace(" ", "-");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\-]", "");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\-+", "-");
        return s.Trim('-');
    }
}

// 3. Update Group Command
public record UpdateProductGroupCommand(
    Guid Id,
    string Name,
    string? Slug,
    string? Description,
    string? Icon,
    int DisplayOrder,
    bool IsActive,
    List<Guid> ProductIds
) : IRequest<AdminProductGroupDto?>;

public class UpdateProductGroupCommandHandler : IRequestHandler<UpdateProductGroupCommand, AdminProductGroupDto?>
{
    private readonly IGokturkDbContext _db;

    public UpdateProductGroupCommandHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<AdminProductGroupDto?> Handle(UpdateProductGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _db.ProductGroups
            .Include(g => g.Items)
            .FirstOrDefaultAsync(g => g.Id == request.Id, cancellationToken);

        if (group == null)
            return null;

        group.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Slug))
        {
            var slug = GenerateSlug(request.Slug);
            if (group.Slug != slug)
            {
                int counter = 1;
                var originalSlug = slug;
                while (await _db.ProductGroups.AnyAsync(g => g.Slug == slug && g.Id != group.Id, cancellationToken))
                {
                    slug = $"{originalSlug}-{counter++}";
                }
                group.Slug = slug;
            }
        }

        group.Description = request.Description?.Trim();
        if (!string.IsNullOrWhiteSpace(request.Icon))
            group.Icon = request.Icon.Trim();
        group.DisplayOrder = request.DisplayOrder;
        group.IsActive = request.IsActive;
        group.MarkAsUpdated();

        // Update items
        _db.ProductGroupItems.RemoveRange(group.Items);
        group.Items.Clear();

        if (request.ProductIds != null && request.ProductIds.Count > 0)
        {
            int order = 1;
            foreach (var pid in request.ProductIds.Distinct())
            {
                group.Items.Add(new ProductGroupItem
                {
                    ProductGroupId = group.Id,
                    ProductId = pid,
                    DisplayOrder = order++
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new AdminProductGroupDto(
            group.Id,
            group.Name,
            group.Slug,
            group.Description,
            group.Icon,
            group.DisplayOrder,
            group.IsActive,
            group.CreatedAt,
            group.Items.Select(i => i.ProductId).ToList(),
            group.Items.Count
        );
    }

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "grup";
        var s = text.ToLowerInvariant().Trim()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u")
            .Replace(" ", "-");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\-]", "");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\-+", "-");
        return s.Trim('-');
    }
}

// 4. Delete Group Command
public record DeleteProductGroupCommand(Guid Id) : IRequest<bool>;

public class DeleteProductGroupCommandHandler : IRequestHandler<DeleteProductGroupCommand, bool>
{
    private readonly IGokturkDbContext _db;

    public DeleteProductGroupCommandHandler(IGokturkDbContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(DeleteProductGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await _db.ProductGroups.FirstOrDefaultAsync(g => g.Id == request.Id, cancellationToken);
        if (group == null)
            return false;

        group.MarkAsDeleted();
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
