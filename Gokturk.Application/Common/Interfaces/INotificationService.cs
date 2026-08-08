using System.Threading.Tasks;

namespace Gokturk.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendOrderConfirmationSmsAsync(string phoneNumber, string customerName, string orderNumber, decimal totalAmount);
    Task SendAdminNewOrderNotificationAsync(string orderNumber, string customerName, decimal totalAmount);
    Task SendEmailNotificationAsync(string toEmail, string subject, string htmlBody);
}
