using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Gokturk.Domain.Catalog.Entities;
using Gokturk.Domain.Production.Entities;
using Gokturk.Domain.Vendor.Entities;
using Gokturk.Domain.Sales.Entities;
using Gokturk.Domain.Fulfillment.Entities;
using Gokturk.Domain.Identity.Entities;

namespace Gokturk.Application.Common.Interfaces;

public interface IGokturkDbContext
{
    DbSet<CategoryEntity> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductAttribute> ProductAttributes { get; }
    DbSet<PriceMatrix> PriceMatrices { get; }
    DbSet<LaminationType> LaminationTypes { get; }
    DbSet<ProductReview> ProductReviews { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<PrintFile> PrintFiles { get; }
    DbSet<PreflightLog> PreflightLogs { get; }
    DbSet<VendorFeed> VendorFeeds { get; }
    DbSet<XmlLog> XmlLogs { get; }
    DbSet<Basket> Baskets { get; }
    DbSet<BasketItem> BasketItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<PaymentTransaction> PaymentTransactions { get; }
    DbSet<Shipment> Shipments { get; }
    DbSet<PackageDetail> PackageDetails { get; }
    DbSet<User> Users { get; }
    DbSet<B2BCompanyProfile> B2BCompanyProfiles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<EmailVerificationToken> EmailVerificationTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
