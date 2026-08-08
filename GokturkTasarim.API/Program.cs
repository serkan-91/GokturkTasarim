using GokturkTasarim.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services (Clean Extensions)
builder.Services
    .AddDatabaseServices(builder.Configuration)
    .AddApplicationServices()
    .AddJwtAuthenticationServices()
    .AddCorsServices();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// 2. Database Seeding & Global Exception Middleware
await app.SeedDatabaseAsync();
app.UseGlobalExceptionHandler();

// 3. Request Pipeline & Middleware
app.UseScalarApiDocs();
app.UseHttpsRedirection();
app.UseCors("AllowAngularUI");
app.UseAuthentication();
app.UseAuthorization();

// 4. Map Minimal APIs & Controllers
app.MapAppEndpoints();

app.Run();
