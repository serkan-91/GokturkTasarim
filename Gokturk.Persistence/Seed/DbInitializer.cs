using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Gokturk.Domain.Catalog.Entities;
using Gokturk.Domain.Identity.Entities;
using Gokturk.Persistence.Contexts;

namespace Gokturk.Persistence.Seed;

public static class DbInitializer
{
    public static async Task SeedAsync(GokturkDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        // 1. Seed Default Admin User if no users exist
        if (!await db.Users.AnyAsync())
        {
            var adminUser = new User
            {
                FullName = "Göktürk Admin",
                Email = "admin@gokturk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = "Admin",
                Phone = "05325182234",
                IsActive = true,
                IsEmailVerified = true
            };

            var customerUser = new User
            {
                FullName = "Örnek Müşteri",
                Email = "musteri@gokturk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Musteri123!"),
                Role = "Customer",
                Phone = "05326668610",
                IsActive = true,
                IsEmailVerified = true
            };

            await db.Users.AddRangeAsync(adminUser, customerUser);
        }

        // 2. Seed Default Categories if empty
        if (!await db.Categories.AnyAsync())
        {
            var categories = new[]
            {
                new CategoryEntity { ExternalId = "cat-kartvizit", ParentExternalId = "0", Name = "Kartvizit & Matbaa", Slug = "kartvizit" },
                new CategoryEntity { ExternalId = "cat-brosur", ParentExternalId = "0", Name = "Broşür & Katalog", Slug = "brosur" },
                new CategoryEntity { ExternalId = "cat-tabela", ParentExternalId = "0", Name = "Tabela & Totem", Slug = "tabela" },
                new CategoryEntity { ExternalId = "cat-promosyon", ParentExternalId = "0", Name = "Kurumsal Promosyon", Slug = "promosyon" },
                new CategoryEntity { ExternalId = "cat-kurye", ParentExternalId = "0", Name = "Motorlu Kurye", Slug = "kurye" },
                new CategoryEntity { ExternalId = "cat-dijital", ParentExternalId = "0", Name = "Dijital Baskı", Slug = "dijital" },

                // Subcategories
                new CategoryEntity { ExternalId = "sub-vip-kartvizit", ParentExternalId = "cat-kartvizit", Name = "VIP & Kabartma Kartvizit", Slug = "vip-kartvizit" },
                new CategoryEntity { ExternalId = "sub-a5-brosur", ParentExternalId = "cat-brosur", Name = "A5 & A4 Broşür", Slug = "a5-brosur" },
                new CategoryEntity { ExternalId = "sub-led-tabela", ParentExternalId = "cat-tabela", Name = "LED Aydınlatmalı Tabela", Slug = "led-tabela" },
                new CategoryEntity { ExternalId = "sub-kalem-set", ParentExternalId = "cat-promosyon", Name = "Baskılı Kalem & Defter Seti", Slug = "kalem-defter" }
            };

            await db.Categories.AddRangeAsync(categories);
        }

        // 3. Seed Default Products if catalog is empty
        if (!await db.Products.AnyAsync())
        {
            var products = new[]
            {
                new Product { ProductCode = "GKT-KV-01", Name = "Standart Kartvizit", Slug = "standart-kartvizit", Category = "Kartvizit & Matbaa", ExternalCategoryId = "cat-kartvizit", BasePrice = 550, Unit = "250 adet", StockQuantity = 1000, ImageUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80", Description = "Mat laminasyon, 350gr kuşe kağıt, çift yüz renkli baskı." },
                new Product { ProductCode = "GKT-KV-02", Name = "VIP 1 Kartvizit (UV Spot)", Slug = "vip-1-kartvizit", Category = "Kartvizit & Matbaa", ExternalCategoryId = "sub-vip-kartvizit", BasePrice = 950, Unit = "250 adet", StockQuantity = 500, ImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", Description = "Parlak laminasyon + lokal UV spot, 400gr premium kuşe." },
                new Product { ProductCode = "GKT-KV-03", Name = "VIP 2 Kartvizit (Gümüş Folyo)", Slug = "vip-2-kartvizit", Category = "Kartvizit & Matbaa", ExternalCategoryId = "sub-vip-kartvizit", BasePrice = 1100, Unit = "250 adet", StockQuantity = 300, ImageUrl = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80", Description = "Siyah zemin + gümüş yaldız folyo baskı, lüks dokulu karton." },
                new Product { ProductCode = "GKT-BR-01", Name = "A5 Broşür (Çift Yüz Renkli)", Slug = "a5-brosur", Category = "Broşür & Katalog", ExternalCategoryId = "sub-a5-brosur", BasePrice = 1600, Unit = "500 adet", StockQuantity = 2000, ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", Description = "A5 ebadında çift yüz canlı renkli baskı, 135gr kuşe." },
                new Product { ProductCode = "GKT-BR-02", Name = "A4 Kırımlı Broşür (3 Katlı)", Slug = "a4-kirimli-brosur", Category = "Broşür & Katalog", ExternalCategoryId = "sub-a5-brosur", BasePrice = 3000, Unit = "500 adet", StockQuantity = 1500, ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80", Description = "3 katlı akordeon kırımlı A4 broşür, parlak kuşe." },
                new Product { ProductCode = "GKT-TB-01", Name = "LED Aydınlatmalı Kutu Harf Tabela", Slug = "led-tabela", Category = "Tabela & Totem", ExternalCategoryId = "sub-led-tabela", BasePrice = 8500, Unit = "adet", StockQuantity = 50, ImageUrl = "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80", Description = "Dış mekana dayanıklı LED ışıklı pleksi kutu harf tabela." },
                new Product { ProductCode = "GKT-PR-01", Name = "Promosyon Logo Baskılı Kalem", Slug = "promosyon-kalem", Category = "Kurumsal Promosyon", ExternalCategoryId = "sub-kalem-set", BasePrice = 3500, Unit = "100 adet", StockQuantity = 5000, ImageUrl = "https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80", Description = "Kurumsal logonuza özel tampon baskılı tükenmez kalem." },
                new Product { ProductCode = "GKT-KR-01", Name = "Motorlu Kurye İçi Hızlı Teslimat", Slug = "motorlu-kurye", Category = "Motorlu Kurye", ExternalCategoryId = "cat-kurye", BasePrice = 120, Unit = "sefer", StockQuantity = 999, ImageUrl = "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80", Description = "İstanbul içi 2 saat içerisinde adrese teslimat kurye hizmeti." }
            };

            await db.Products.AddRangeAsync(products);
        }
        else
        {
            // Ensure existing products without ImageUrl get updated with valid default images
            var productsWithoutImg = await db.Products.Where(p => string.IsNullOrEmpty(p.ImageUrl)).ToListAsync();
            if (productsWithoutImg.Count > 0)
            {
                foreach (var p in productsWithoutImg)
                {
                    if (p.Category.Contains("Kartvizit", StringComparison.OrdinalIgnoreCase))
                        p.ImageUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80";
                    else if (p.Category.Contains("Broşür", StringComparison.OrdinalIgnoreCase))
                        p.ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
                    else if (p.Category.Contains("Tabela", StringComparison.OrdinalIgnoreCase))
                        p.ImageUrl = "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80";
                    else if (p.Category.Contains("Promosyon", StringComparison.OrdinalIgnoreCase))
                        p.ImageUrl = "https://images.unsplash.com/photo-1585336261026-8f5786372969?auto=format&fit=crop&w=600&q=80";
                    else
                        p.ImageUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80";
                }
            }
        }

        await db.SaveChangesAsync();

        // 4. Seed Sample Reviews if empty
        if (!await db.ProductReviews.AnyAsync())
        {
            var firstProduct = await db.Products.FirstOrDefaultAsync();
            if (firstProduct != null)
            {
                var reviews = new[]
                {
                    new ProductReview
                    {
                        ProductId = firstProduct.Id.ToString(),
                        UserId = Guid.NewGuid(),
                        CustomerName = "Ahmet Y.",
                        Rating = 5,
                        Comment = "Baskı kalitesi mükemmel! Kartvizitler 1 günde teslim edildi, çok memnun kaldım."
                    },
                    new ProductReview
                    {
                        ProductId = firstProduct.Id.ToString(),
                        UserId = Guid.NewGuid(),
                        CustomerName = "Selin K.",
                        Rating = 4,
                        Comment = "Selefon kalitesi çok iyi, paketleme özenliydi. Teşekkürler."
                    }
                };
                await db.ProductReviews.AddRangeAsync(reviews);
                await db.SaveChangesAsync();
            }
        }
    }
}
