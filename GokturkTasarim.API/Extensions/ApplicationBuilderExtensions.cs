using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using GokturkTasarim.API.Endpoints;
using GokturkTasarim.API.Middlewares;
using Gokturk.Persistence.Contexts;
using Gokturk.Persistence.Seed;

namespace GokturkTasarim.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static WebApplication UseGlobalExceptionHandler(this WebApplication app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }

    public static async Task SeedDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<GokturkDbContext>();
        await DbInitializer.SeedAsync(db);
    }

    public static WebApplication UseScalarApiDocs(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            app.MapScalarApiReference(options =>
            {
                options.Title = "Göktürk Tasarım API Docs";
                options.Theme = ScalarTheme.Purple;
                options.DefaultHttpClient = new(ScalarTarget.JavaScript, ScalarClient.Axios);
            });
        }
        return app;
    }

    public static WebApplication MapAppEndpoints(this WebApplication app)
    {
        app.MapGet("/api/health", async (GokturkDbContext db) =>
        {
            var canConnect = await db.Database.CanConnectAsync();
            return Results.Ok(new
            {
                status = "Online",
                environment = app.Environment.EnvironmentName,
                version = "1.0.0",
                databaseConnected = canConnect,
                serverTime = DateTime.UtcNow
            });
        })
        .WithName("GetHealthStatus");

        app.MapControllers();
        app.MapCatalogEndpoints();
        app.MapVendorEndpoints();
        app.MapPaymentEndpoints();

        return app;
    }
}
