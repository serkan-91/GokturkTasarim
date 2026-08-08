using System;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Gokturk.Application.Catalog.Queries;
using Gokturk.Infrastructure.Authentication;
using Gokturk.Infrastructure.Services;
using Gokturk.Persistence.Contexts;

namespace GokturkTasarim.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
    {
        var pgConnectionString = config.GetConnectionString("PostgreSQL");

        services.AddDbContext<GokturkDbContext>(options =>
        {
            if (!string.IsNullOrEmpty(pgConnectionString) && IsPostgreSqlReachable(pgConnectionString))
            {
                options.UseNpgsql(pgConnectionString);
            }
            else
            {
                // Fallback to InMemory Database when PostgreSQL port 5432 is not active
                options.UseInMemoryDatabase("GokturkInMemoryDb");
            }
        });

        services.AddScoped<Gokturk.Application.Common.Interfaces.IGokturkDbContext>(provider => provider.GetRequiredService<GokturkDbContext>());
        return services;
    }

    private static bool IsPostgreSqlReachable(string connectionString)
    {
        try
        {
            var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
            var host = string.IsNullOrWhiteSpace(builder.Host) ? "127.0.0.1" : builder.Host;
            var port = builder.Port > 0 ? builder.Port : 5432;

            using var client = new TcpClient();
            var asyncResult = client.BeginConnect(host, port, null, null);
            var isConnected = asyncResult.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(400));
            return isConnected && client.Connected;
        }
        catch
        {
            return false;
        }
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpClient();
        services.AddMemoryCache();
        services.AddOutputCache(options =>
        {
            options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(10)));
            options.AddPolicy("CatalogCache", builder => builder.Expire(TimeSpan.FromMinutes(15)).Tag("catalog"));
        });

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetProductsQuery).Assembly));
        
        // Background Queue Services
        services.AddSingleton<BackgroundQueueService>();
        services.AddSingleton<Gokturk.Application.Common.Interfaces.IBackgroundQueueService>(sp => sp.GetRequiredService<BackgroundQueueService>());
        services.AddHostedService<BackgroundQueueWorker>();

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<Gokturk.Application.Common.Interfaces.INotificationService, Gokturk.Infrastructure.Services.NotificationService>();
        services.AddScoped<Gokturk.Application.Vendor.Abstractions.IVendorFeedParserService, Gokturk.Infrastructure.Vendor.VendorFeedParserService>();
        services.AddScoped<Gokturk.Application.Sales.Abstractions.IPaymentGatewayService, Gokturk.Infrastructure.Payments.PaymentGatewayService>();
        services.AddHostedService<Gokturk.Infrastructure.Vendor.PromojoySyncWorker>();
        return services;
    }

    public static IServiceCollection AddJwtAuthenticationServices(this IServiceCollection services)
    {
        var jwtSecretKey = "GokturkTasarim_SuperSecret_Key_For_Jwt_Security_2026!";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
                ValidateIssuer = true,
                ValidIssuer = "GokturkTasarimAPI",
                ValidateAudience = true,
                ValidAudience = "GokturkTasarimUI",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.TryGetValue("X-Access-Token", out var accessToken))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    public static IServiceCollection AddCorsServices(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngularUI", policy =>
            {
                policy.WithOrigins(
                        "https://localhost:4200",
                        "http://localhost:4200",
                        "https://127.0.0.1:4200",
                        "http://127.0.0.1:4200"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
