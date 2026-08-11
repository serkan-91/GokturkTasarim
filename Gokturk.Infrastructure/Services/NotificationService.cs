using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Gokturk.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ILogger<NotificationService> _logger;
    private readonly IBackgroundQueueService _queueService;
    private readonly IConfiguration _configuration;

    public NotificationService(
        ILogger<NotificationService> logger,
        IBackgroundQueueService queueService,
        IConfiguration configuration)
    {
        _logger = logger;
        _queueService = queueService;
        _configuration = configuration;
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
        var smtpHost = _configuration["SmtpSettings:Host"] ?? "mail.turkticaret.net";
        var smtpPort = int.TryParse(_configuration["SmtpSettings:Port"], out var port) ? port : 587;
        var senderEmail = _configuration["SmtpSettings:SenderEmail"] ?? "info@gokturktasarim.com";
        var senderName = _configuration["SmtpSettings:SenderName"] ?? "Göktürk Tasarım";
        var username = _configuration["SmtpSettings:Username"] ?? "info@gokturktasarim.com";
        var password = _configuration["SmtpSettings:Password"] ?? string.Empty;

        await _queueService.QueueBackgroundWorkItemAsync(async (sp, cancellationToken) =>
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                
                var secureOption = smtpPort == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : SecureSocketOptions.StartTlsWhenAvailable;

                await client.ConnectAsync(smtpHost, smtpPort, secureOption, cancellationToken);

                if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                {
                    await client.AuthenticateAsync(username, password, cancellationToken);
                }

                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);

                _logger.LogInformation("[ASYNC MAILKIT EMAIL SENT to {Email}] Subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ASYNC MAILKIT ERROR] Failed to send email to {Email}. Host: {Host}:{Port}", toEmail, smtpHost, smtpPort);
            }
        });
    }
}

