using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IBackgroundQueueService _queueService;

    public NotificationService(ILogger<NotificationService> logger, IBackgroundQueueService queueService)
    {
        _logger = logger;
        _queueService = queueService;
    }

    public async Task SendOrderConfirmationSmsAsync(string phoneNumber, string customerName, string orderNumber, decimal totalAmount)
    {
        await _queueService.QueueBackgroundWorkItemAsync((sp, cancellationToken) =>
        {
            var message = $"Sayın {customerName}, {orderNumber} kodlu siparişiniz başarıyla alınmıştır. Toplam Tutar: {totalAmount:N2} TL. Göktürk Tasarım.";
            _logger.LogInformation("[ASYNC SMS SENT to {Phone}]: {Message}", phoneNumber, message);

            // Netgsm / IletiMerkezi HTTP POST API Call buraya eklenecektir
            return ValueTask.CompletedTask;
        });
    }

    public async Task SendAdminNewOrderNotificationAsync(string orderNumber, string customerName, decimal totalAmount)
    {
        await _queueService.QueueBackgroundWorkItemAsync((sp, cancellationToken) =>
        {
            var message = $"🚨 YENİ SİPARİŞ! Kod: {orderNumber}, Müşteri: {customerName}, Tutar: {totalAmount:N2} TL.";
            _logger.LogInformation("[ASYNC ADMIN NOTIFICATION SENT]: {Message}", message);

            // Yöneticiye Telegram / WhatsApp / SMS bildirimi
            return ValueTask.CompletedTask;
        });
    }

    public async Task SendEmailNotificationAsync(string toEmail, string subject, string htmlBody)
    {
        await _queueService.QueueBackgroundWorkItemAsync((sp, cancellationToken) =>
        {
            _logger.LogInformation("[ASYNC EMAIL SENT to {Email}] Subject: {Subject}", toEmail, subject);

            // SMTP Client Email gönderimi
            return ValueTask.CompletedTask;
        });
    }
}

