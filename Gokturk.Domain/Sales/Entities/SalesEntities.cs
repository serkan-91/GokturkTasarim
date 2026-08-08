using System;
using System.Collections.Generic;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Sales.Entities;

public class Basket : BaseEntity, IAggregateRoot
{
    public Guid UserId { get; set; }
    public ICollection<BasketItem> Items { get; set; } = new List<BasketItem>();
    public decimal TotalAmount { get; set; }
}

public class BasketItem : BaseEntity
{
    public Guid BasketId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class Order : BaseEntity, IAggregateRoot
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = "Pending"; // Pending, Paid, InProduction, Shipped, Delivered, Cancelled
    public string PaymentMethod { get; set; } = "BankTransfer"; // BankTransfer, CreditCard_PayTR, CreditCard_iyzico
    public string ShippingAddress { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? PaymentReferenceCode { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}

public class PaymentTransaction : BaseEntity, IAggregateRoot
{
    public Guid OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string PaymentNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string PaymentMethod { get; set; } = "BankTransfer"; // BankTransfer, CreditCard_PayTR, CreditCard_iyzico
    public string PaymentProvider { get; set; } = "PayTR"; // PayTR, iyzico, BankTransfer
    public string Status { get; set; } = "Pending"; // Pending, Approved, Failed, Refunded
    public string? PaymentReferenceCode { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? PayTrToken { get; set; }
    public string? ErrorMessage { get; set; }
}

public class BankAccountInfo
{
    public string BankName { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = "Göktürk Reklam ve Tasarım Ltd. Şti.";
    public string Iban { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
}
