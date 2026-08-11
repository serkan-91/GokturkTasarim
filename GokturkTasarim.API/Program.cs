using GokturkTasarim.API.Extensions;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Yapılandırma dosyalarını esnek şekilde yükle
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// 1. Add Services (Clean Extensions)
builder.Services
    .AddDatabaseServices(builder.Configuration)
    .AddApplicationServices()
    .AddJwtAuthenticationServices()
    .AddCorsServices();

// Nginx Forwarded Headers Yapılandırması
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Nginx üzerinden gelen Header'ları oku (Pipeline'ın en başında olmalı)
app.UseForwardedHeaders();

// 2. Database Seeding & Global Exception Middleware
await app.SeedDatabaseAsync();
app.UseGlobalExceptionHandler();

// 3. Request Pipeline & Middleware
app.UseScalarApiDocs();
// app.UseHttpsRedirection(); -> Nginx SSL yaptığı için kapalı kalması doğru!
app.UseCors("AllowAngularUI");
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();

// 4. Map Minimal APIs & Controllers
app.MapAppEndpoints();

app.Run();