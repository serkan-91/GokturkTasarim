using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Gokturk.Application.Sales.Abstractions;
using Gokturk.Domain.Sales.Entities;

namespace Gokturk.Infrastructure.Payments;

public class PaymentGatewayService : IPaymentGatewayService
{
    private static readonly List<BankAccountInfo> BankAccounts = new()
    {
        new BankAccountInfo
        {
            BankName = "Garanti BBVA",
            AccountHolder = "Göktürk Reklam ve Tasarım Ltd. Şti.",
            Iban = "TR62 0006 2000 0000 0090 1234 56",
            BranchCode = "1234 - Göktürk Şubesi",
            LogoUrl = "https://www.garantibbva.com.tr/assets/img/logo.svg"
        },
        new BankAccountInfo
        {
            BankName = "T.C. Ziraat Bankası",
            AccountHolder = "Göktürk Reklam ve Tasarım Ltd. Şti.",
            Iban = "TR44 0001 0000 0000 0088 7654 32",
            BranchCode = "0988 - Eyüpsultan Şubesi",
            LogoUrl = "https://www.ziraatbank.com.tr/PublishingImages/Logo/ziraat_logo.png"
        },
        new BankAccountInfo
        {
            BankName = "Türkiye İş Bankası",
            AccountHolder = "Göktürk Reklam ve Tasarım Ltd. Şti.",
            Iban = "TR12 0006 4000 0000 0044 5566 77",
            BranchCode = "4400 - Kemerburgaz Şubesi",
            LogoUrl = "https://www.isbank.com.tr/staticimages/isbank_logo.png"
        }
    };

    public List<BankAccountInfo> GetCorporateBankAccounts()
    {
        return BankAccounts;
    }

    public Task<BankTransferPaymentResultDto> ProcessBankTransferAsync(CreateBankTransferPaymentRequestDto request)
    {
        var randomRefNum = new Random().Next(1000, 9999);
        var refCode = $"GKT-EFT-{randomRefNum}";
        var paymentNum = $"PAY-TRF-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

        var targetBank = BankAccounts.Find(b => b.BankName.Equals(request.BankName, StringComparison.OrdinalIgnoreCase))
                         ?? BankAccounts[0];

        var result = new BankTransferPaymentResultDto(
            Success: true,
            PaymentNumber: paymentNum,
            ReferenceCode: refCode,
            BankName: targetBank.BankName,
            AccountHolder: targetBank.AccountHolder,
            Iban: targetBank.Iban,
            TotalAmount: request.Amount,
            Message: $"Siparişiniz başarıyla alındı! Lütfen havale/EFT yaparken açıklama kısmına '{refCode}' kodunu yazınız."
        );

        return Task.FromResult(result);
    }

    public Task<PayTrTokenResultDto> CreatePayTrPaymentTokenAsync(CreatePayTrTokenRequestDto request)
    {
        // PayTR Merchant Credentials (Configurable)
        var merchantId = "384912";
        var merchantKey = "GokturkPayTrKey2026";
        var merchantSalt = "GokturkPayTrSalt2026";

        var userIp = "127.0.0.1";
        var merchantOid = request.OrderNumber;
        var email = string.IsNullOrWhiteSpace(request.CustomerEmail) ? "musteri@gokturk.com" : request.CustomerEmail;
        var paymentAmount = ((int)(request.Amount * 100)).ToString(); // Kuruş cinsinden

        // Create PayTR Token Signature
        var hashStr = $"{merchantId}{userIp}{merchantOid}{email}{paymentAmount}basket{merchantSalt}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(merchantKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(hashStr));
        var payTrToken = Convert.ToBase64String(hashBytes);

        var result = new PayTrTokenResultDto(
            Success: true,
            Token: payTrToken,
            IframeUrl: $"https://www.paytr.com/odeme/api/{payTrToken}",
            ErrorMessage: null
        );

        return Task.FromResult(result);
    }
}
