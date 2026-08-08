using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Application.Vendor.Abstractions;
using Gokturk.Domain.Catalog.Entities;
using Gokturk.Domain.Vendor.Entities;

namespace Gokturk.Application.Vendor.Commands;

public record SyncVendorDataCommand(
    string CategoryFeedUrl = "https://www.promojoy.com.tr/xml/category.xml",
    string ProductFeedUrl = "https://www.promojoy.com.tr/xml/product.xml",
    string VendorName = "Promojoy"
) : IRequest<SyncVendorResultDto>;

public record SyncVendorResultDto(
    bool Success,
    string Message,
    int CategoriesSynced,
    int ProductsSynced,
    DateTime SyncedAt
);

public class SyncVendorDataCommandHandler : IRequestHandler<SyncVendorDataCommand, SyncVendorResultDto>
{
    private readonly IGokturkDbContext _db;
    private readonly IVendorFeedParserService _feedParser;

    public SyncVendorDataCommandHandler(IGokturkDbContext db, IVendorFeedParserService feedParser)
    {
        _db = db;
        _feedParser = feedParser;
    }

    public async Task<SyncVendorResultDto> Handle(SyncVendorDataCommand request, CancellationToken cancellationToken)
    {
        var feedLog = new VendorFeed
        {
            VendorName = request.VendorName,
            FeedUrl = request.ProductFeedUrl,
            SyncStatus = "Syncing"
        };
        await _db.VendorFeeds.AddAsync(feedLog, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        try
        {
            // 1. Sync Categories
            var categoryDtos = await _feedParser.ParseCategoryFeedAsync(request.CategoryFeedUrl);
            int catCount = 0;

            foreach (var cDto in categoryDtos)
            {
                var existing = await _db.Categories
                    .FirstOrDefaultAsync(c => c.ExternalId == cDto.Id, cancellationToken);

                if (existing == null)
                {
                    var newCat = new CategoryEntity
                    {
                        ExternalId = cDto.Id,
                        ParentExternalId = cDto.ParentId,
                        Name = cDto.Name,
                        Slug = GenerateSlug(cDto.Name)
                    };
                    await _db.Categories.AddAsync(newCat, cancellationToken);
                }
                else
                {
                    existing.Name = cDto.Name;
                    existing.ParentExternalId = cDto.ParentId;
                    existing.MarkAsUpdated();
                }
                catCount++;
            }

            await _db.SaveChangesAsync(cancellationToken);

            // Build Category Map for quick lookup
            var categoryMap = await _db.Categories
                .ToDictionaryAsync(c => c.ExternalId, c => c.Name, cancellationToken);

            // 2. Sync Products
            var productDtos = await _feedParser.ParseProductFeedAsync(request.ProductFeedUrl);
            int prodCount = 0;

            foreach (var pDto in productDtos)
            {
                var existing = await _db.Products
                    .FirstOrDefaultAsync(p => p.ProductCode == pDto.Code || p.Slug == pDto.Id, cancellationToken);

                var categoryName = categoryMap.TryGetValue(pDto.CategoryId, out var name) ? name : "Promosyon";

                if (existing == null)
                {
                    var newProd = new Product
                    {
                        ProductCode = string.IsNullOrEmpty(pDto.Code) ? $"PJ-{pDto.Id}" : pDto.Code,
                        Name = pDto.Name,
                        Slug = GenerateSlug(pDto.Name),
                        Description = pDto.Description,
                        Category = categoryName,
                        ExternalCategoryId = pDto.CategoryId,
                        BasePrice = pDto.Price,
                        Unit = string.IsNullOrEmpty(pDto.Unit) ? "ADET" : pDto.Unit,
                        StockQuantity = pDto.Stock,
                        ImageUrl = pDto.ImageUrl,
                        ExternalProductUrl = pDto.ProductUrl,
                        IsActive = true
                    };
                    await _db.Products.AddAsync(newProd, cancellationToken);
                }
                else
                {
                    existing.Name = pDto.Name;
                    existing.Description = pDto.Description;
                    existing.BasePrice = pDto.Price;
                    existing.StockQuantity = pDto.Stock;
                    existing.ImageUrl = pDto.ImageUrl;
                    existing.ExternalProductUrl = pDto.ProductUrl;
                    existing.Category = categoryName;
                    existing.ExternalCategoryId = pDto.CategoryId;
                    existing.MarkAsUpdated();
                }
                prodCount++;
            }

            await _db.SaveChangesAsync(cancellationToken);

            // Update Feed Log
            feedLog.SyncStatus = "Completed";
            feedLog.LastSyncedAt = DateTime.UtcNow;
            feedLog.TotalProductsSynced = prodCount;

            await _db.XmlLogs.AddAsync(new XmlLog
            {
                VendorFeedId = feedLog.Id,
                LogType = "Info",
                Message = $"Senkronizasyon başarılı: {catCount} kategori, {prodCount} ürün işlendi."
            }, cancellationToken);

            await _db.SaveChangesAsync(cancellationToken);

            return new SyncVendorResultDto(true, "Tedarikçi verileri başarıyla senkronize edildi.", catCount, prodCount, DateTime.UtcNow);
        }
        catch (Exception ex)
        {
            feedLog.SyncStatus = "Failed";
            await _db.XmlLogs.AddAsync(new XmlLog
            {
                VendorFeedId = feedLog.Id,
                LogType = "Error",
                Message = $"Senkronizasyon hatası: {ex.Message}"
            }, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);

            return new SyncVendorResultDto(false, $"Senkronizasyon hatası: {ex.Message}", 0, 0, DateTime.UtcNow);
        }
    }

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return Guid.NewGuid().ToString("N");

        text = text.ToLowerInvariant()
            .Replace("ç", "c").Replace("ğ", "g").Replace("ı", "i")
            .Replace("ö", "o").Replace("ş", "s").Replace("ü", "u");

        var chars = text.Where(c => char.IsLetterOrDigit(c) || c == ' ' || c == '-').ToArray();
        var clean = new string(chars).Trim().Replace(" ", "-");
        while (clean.Contains("--")) clean = clean.Replace("--", "-");

        return clean.Length > 80 ? clean.Substring(0, 80) : clean;
    }
}
