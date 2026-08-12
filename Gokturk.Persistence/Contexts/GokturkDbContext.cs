using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Catalog.Entities;
using Gokturk.Domain.Production.Entities;
using Gokturk.Domain.Vendor.Entities;
using Gokturk.Domain.Sales.Entities;
using Gokturk.Domain.Fulfillment.Entities;
using Gokturk.Domain.Identity.Entities;

namespace Gokturk.Persistence.Contexts;

public class GokturkDbContext : DbContext, IGokturkDbContext
{
    public GokturkDbContext(DbContextOptions<GokturkDbContext> options) : base(options) { }

    // 1. Catalog Context
    public DbSet<CategoryEntity> Categories => Set<CategoryEntity>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<PriceMatrix> PriceMatrices => Set<PriceMatrix>();
    public DbSet<LaminationType> LaminationTypes => Set<LaminationType>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<ProductGroup> ProductGroups => Set<ProductGroup>();
    public DbSet<ProductGroupItem> ProductGroupItems => Set<ProductGroupItem>();

    // 2. Production Context
    public DbSet<PrintFile> PrintFiles => Set<PrintFile>();
    public DbSet<PreflightLog> PreflightLogs => Set<PreflightLog>();

    // 3. Vendor Context
    public DbSet<VendorFeed> VendorFeeds => Set<VendorFeed>();
    public DbSet<XmlLog> XmlLogs => Set<XmlLog>();

    // 4. Sales Context
    public DbSet<Basket> Baskets => Set<Basket>();
    public DbSet<BasketItem> BasketItems => Set<BasketItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    // 5. Fulfillment Context
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<PackageDetail> PackageDetails => Set<PackageDetail>();

    // 6. Identity Context
    public DbSet<User> Users => Set<User>();
    public DbSet<B2BCompanyProfile> B2BCompanyProfiles => Set<B2BCompanyProfile>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filter for Soft Delete
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
        modelBuilder.Entity<ProductGroup>().HasQueryFilter(g => !g.IsDeleted);

        // Email index
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // RefreshToken index
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(r => r.Token)
            .IsUnique();
    }
}
