using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Sales.Entities;

namespace Gokturk.Application.Sales.Commands;

public record CreateOrderItemDto(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice
);

public record CreateOrderCommand(
    string CustomerName,
    string CustomerPhone,
    string CustomerEmail,
    string ShippingAddress,
    string BillingAddress,
    string PaymentMethod,
    string? Notes,
    List<CreateOrderItemDto> Items
) : IRequest<CreateOrderResultDto>;

public record CreateOrderResultDto(
    Guid OrderId,
    string OrderNumber,
    decimal TotalAmount,
    string Status,
    string Message
);

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, CreateOrderResultDto>
{
    private readonly IGokturkDbContext _context;
    private readonly Gokturk.Application.Common.Interfaces.INotificationService _notificationService;

    public CreateOrderCommandHandler(
        IGokturkDbContext context,
        Gokturk.Application.Common.Interfaces.INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<CreateOrderResultDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.Items == null || !request.Items.Any())
        {
            throw new ArgumentException("Sipariş en az bir ürün içermelidir.");
        }

        // Benzersiz Sipariş Kodu Üret (Örn: GKT-2026-894123)
        var randomCode = new Random().Next(100000, 999999);
        var orderNumber = $"GKT-{DateTime.UtcNow:yyyyMMdd}-{randomCode}";

        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var itemDto in request.Items)
        {
            var itemTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                ProductName = itemDto.ProductName,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice
            });

            // Ürün stok miktarını düş
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == itemDto.ProductId, cancellationToken);
            if (product != null)
            {
                product.StockQuantity = Math.Max(0, product.StockQuantity - itemDto.Quantity);
                product.MarkAsUpdated();
            }
        }

        // KDV Dahil Hesaplama (%20)
        var grandTotal = totalAmount * 1.20m;

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = Guid.Empty, // Misafir veya Girişli müşteri
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            ShippingAddress = request.ShippingAddress,
            BillingAddress = string.IsNullOrWhiteSpace(request.BillingAddress) ? request.ShippingAddress : request.BillingAddress,
            PaymentMethod = request.PaymentMethod,
            TotalAmount = grandTotal,
            OrderStatus = "PendingPayment",
            PaymentReferenceCode = randomCode.ToString(),
            Items = orderItems
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        // Bildirimleri arka planda tetikle
        await _notificationService.SendOrderConfirmationSmsAsync(order.CustomerPhone, order.CustomerName, order.OrderNumber, order.TotalAmount);
        await _notificationService.SendAdminNewOrderNotificationAsync(order.OrderNumber, order.CustomerName, order.TotalAmount);

        return new CreateOrderResultDto(
            order.Id,
            order.OrderNumber,
            order.TotalAmount,
            order.OrderStatus,
            "Siparişiniz başarıyla kaydedildi."
        );
    }
}
