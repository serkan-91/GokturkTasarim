using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Gokturk.Infrastructure.Services;

public class BackgroundQueueWorker : BackgroundService
{
    private readonly BackgroundQueueService _queueService;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackgroundQueueWorker> _logger;

    public BackgroundQueueWorker(
        BackgroundQueueService queueService,
        IServiceProvider serviceProvider,
        ILogger<BackgroundQueueWorker> logger)
    {
        _queueService = queueService;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Background Queue Worker başlatıldı. Asenkron görevler işlenmeye hazır.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var workItem = await _queueService.DequeueAsync(stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                await workItem(scope.ServiceProvider, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when service stops
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Arka plan görevi çalıştırılırken bir hata oluştu.");
            }
        }

        _logger.LogInformation("Background Queue Worker sonlandırıldı.");
    }
}
