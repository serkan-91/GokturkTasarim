using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Vendor.Commands;

namespace Gokturk.Infrastructure.Vendor;

public class PromojoySyncWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PromojoySyncWorker> _logger;
    private readonly TimeSpan _syncInterval = TimeSpan.FromHours(6); // Run every 6 hours

    public PromojoySyncWorker(IServiceProvider serviceProvider, ILogger<PromojoySyncWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Promojoy Sync Worker başlatıldı. Periyot: {Interval}", _syncInterval);

        // Wait 2 seconds after app startup before first background sync
        await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Promojoy XML/JSON otomatik arka plan senkronizasyonu başlatılıyor...");

                using (var scope = _serviceProvider.CreateScope())
                {
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var result = await mediator.Send(new SyncVendorDataCommand(), stoppingToken);

                    _logger.LogInformation("Promojoy senkronizasyonu tamamlandı: {Categories} kategori, {Products} ürün işlendi.",
                        result.CategoriesSynced, result.ProductsSynced);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Promojoy senkronizasyonu sırasında hata oluştu: {Message}", ex.Message);
            }

            await Task.Delay(_syncInterval, stoppingToken);
        }
    }
}
