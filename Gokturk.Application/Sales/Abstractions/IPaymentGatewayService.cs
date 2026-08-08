using System.Collections.Generic;
using System.Threading.Tasks;
using Gokturk.Domain.Sales.Entities;

namespace Gokturk.Application.Sales.Abstractions;

public record CreatePayTrTokenRequestDto(
    string OrderNumber,
    decimal Amount,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    string CustomerAddress,
    List<PayTrBasketItemDto> BasketItems
);

public record PayTrBasketItemDto(
    string Name,
    decimal Price,
    int Quantity
);

public record PayTrTokenResultDto(
    bool Success,
    string? Token,
    string? IframeUrl,
    string? ErrorMessage
);

public record CreateBankTransferPaymentRequestDto(
    string OrderNumber,
    decimal Amount,
    string CustomerName,
    string CustomerPhone,
    string CustomerAddress,
    string BankName,
    string Notes
);

public record BankTransferPaymentResultDto(
    bool Success,
    string PaymentNumber,
    string ReferenceCode,
    string BankName,
    string AccountHolder,
    string Iban,
    decimal TotalAmount,
    string Message
);

public interface IPaymentGatewayService
{
    Task<PayTrTokenResultDto> CreatePayTrPaymentTokenAsync(CreatePayTrTokenRequestDto request);
    Task<BankTransferPaymentResultDto> ProcessBankTransferAsync(CreateBankTransferPaymentRequestDto request);
    List<BankAccountInfo> GetCorporateBankAccounts();
}
