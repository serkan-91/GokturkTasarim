using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Common.Interfaces;

namespace Gokturk.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(ILogger<NotificationService> logger)
    {
        _logger = logger;
    }

    public Task SendOrderConfirmationSmsAsync(string phoneNumber, string customerName, string orderNumber, decimal totalAmount)
    {
        var message = $"Sayın {customerName}, {orderNumber} kodlu siparişiniz başarıyla alınmıştır. Toplam Tutar: {totalAmount:N2} TL. Göktürk Tasarım.";
        _logger.LogInformation("[SMS SENT to {Phone}]: {Message}", phoneNumber, message);
        
        // Netgsm / IletiMerkezi HTTP POST API Call buraya eklenecektir
        return Task.CompletedTask;
    }

    public Task SendAdminNewOrderNotificationAsync(string orderNumber, string customerName, decimal totalAmount)
    {
        var message = $"🚨 YENİ SİPARİŞ! Kod: {orderNumber}, Müşteri: {customerName}, Tutar: {totalAmount:N2} TL.";
        _logger.LogInformation("[ADMIN NOTIFICATION SENT]: {Message}", message);

        // Yöneticiye Telegram / WhatsApp / SMS bildirimi
        return Task.CompletedTask;
    }

    public Task SendEmailNotificationAsync(string toEmail, string subject, string htmlBody)
    {
        _logger.LogInformation("[EMAIL SENT to {Email}] Subject: {Subject}", toEmail, subject);

        // SMTP Client Email gönderimi
        return Task.CompletedTask;
    }
}
