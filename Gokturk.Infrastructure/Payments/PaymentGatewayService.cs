using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Sales.Abstractions;
using Gokturk.Domain.Sales.Entities;

namespace Gokturk.Infrastructure.Payments;

public class PaymentGatewayService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<PaymentGatewayService> _logger;

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

    public PaymentGatewayService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<PaymentGatewayService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

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

    public async Task<PayTrTokenResultDto> CreatePayTrPaymentTokenAsync(CreatePayTrTokenRequestDto request)
    {
        try
        {
            var payTrSection = _configuration.GetSection("PayTR");
            var merchantId = payTrSection["MerchantId"] ?? "736442";
            var merchantKey = payTrSection["MerchantKey"] ?? "";
            var merchantSalt = payTrSection["MerchantSalt"] ?? "";
            var testMode = payTrSection["TestMode"] ?? "1";
            var okUrl = payTrSection["OkUrl"] ?? "https://gokturkpromosyon.com/odeme-basarili";
            var failUrl = payTrSection["FailUrl"] ?? "https://gokturkpromosyon.com/odeme-basarisiz";

            var userIp = string.IsNullOrWhiteSpace(request.UserIp) || request.UserIp == "::1" || request.UserIp == "127.0.0.1"
                ? "127.0.0.1"
                : request.UserIp;

            // PayTR strictly requires merchant_oid to be alphanumeric without hyphens or special chars
            var rawOid = string.IsNullOrWhiteSpace(request.OrderNumber) ? $"GKT{DateTime.UtcNow:yyyyMMddHHmmss}" : request.OrderNumber;
            var merchantOid = System.Text.RegularExpressions.Regex.Replace(rawOid, "[^a-zA-Z0-9]", "");
            if (string.IsNullOrWhiteSpace(merchantOid))
            {
                merchantOid = $"GKT{DateTime.UtcNow.Ticks}";
            }

            var email = string.IsNullOrWhiteSpace(request.CustomerEmail) ? "musteri@gokturktasarim.com" : request.CustomerEmail;
            var userName = string.IsNullOrWhiteSpace(request.CustomerName) ? "Müşteri" : request.CustomerName;
            var userAddress = string.IsNullOrWhiteSpace(request.CustomerAddress) ? "İstanbul" : request.CustomerAddress;
            var userPhone = string.IsNullOrWhiteSpace(request.CustomerPhone) ? "05000000000" : request.CustomerPhone;

            // Kuruş cinsinden tutar (Örn: 100.50 TL -> 10050)
            var paymentAmount = ((int)Math.Round(request.Amount * 100, MidpointRounding.AwayFromZero)).ToString();

            // Sepet oluşturma (JSON format: [ ["Ürün Adı", "Fiyat", Adet], ... ])
            var basketList = new List<object[]>();
            if (request.BasketItems != null && request.BasketItems.Count > 0)
            {
                foreach (var item in request.BasketItems)
                {
                    basketList.Add(new object[]
                    {
                        item.Name,
                        item.Price.ToString("0.00", CultureInfo.InvariantCulture),
                        item.Quantity
                    });
                }
            }
            else
            {
                basketList.Add(new object[]
                {
                    "Göktürk Tasarım Siparişi",
                    request.Amount.ToString("0.00", CultureInfo.InvariantCulture),
                    1
                });
            }

            var basketJson = JsonSerializer.Serialize(basketList);
            var userBasketBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(basketJson));

            var currency = "TL";
            var noInstallment = "0";
            var maxInstallment = "0";
            var timeoutLimit = "30";
            var debugOn = "1";

            // Hash String Format: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
            var hashStr = $"{merchantId}{userIp}{merchantOid}{email}{paymentAmount}{userBasketBase64}{noInstallment}{maxInstallment}{currency}{testMode}{merchantSalt}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(merchantKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(hashStr));
            var payTrToken = Convert.ToBase64String(hashBytes);

            var postData = new Dictionary<string, string>
            {
                { "merchant_id", merchantId },
                { "user_ip", userIp },
                { "merchant_oid", merchantOid },
                { "email", email },
                { "payment_amount", paymentAmount },
                { "paytr_token", payTrToken },
                { "user_basket", userBasketBase64 },
                { "user_name", userName },
                { "user_address", userAddress },
                { "user_phone", userPhone },
                { "merchant_ok_url", okUrl },
                { "merchant_fail_url", failUrl },
                { "timeout_limit", timeoutLimit },
                { "currency", currency },
                { "test_mode", testMode },
                { "no_installment", noInstallment },
                { "max_installment", maxInstallment },
                { "debug_on", debugOn }
            };

            // PayTR Card Storage (Kart Saklama) - Attach unique persistent user_token
            string? userToken = null;
            if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                userToken = "UTOK" + System.Text.RegularExpressions.Regex.Replace(request.UserId, "[^a-zA-Z0-9]", "");
            }
            else if (!string.IsNullOrWhiteSpace(email) && !email.Contains("musteri@gokturktasarim.com"))
            {
                using var sha = SHA256.Create();
                var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(email.ToLowerInvariant() + merchantSalt));
                userToken = "UTOK" + Convert.ToHexString(hash).Substring(0, 24);
            }

            if (!string.IsNullOrWhiteSpace(userToken))
            {
                postData["user_token"] = userToken;
            }

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(20);

            var response = await client.PostAsync("https://www.paytr.com/odeme/api/get-token", new FormUrlEncodedContent(postData));
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("PayTR Token Response for Order {OrderNumber}: {Response}", merchantOid, responseContent);

            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            if (root.TryGetProperty("status", out var statusProp) && statusProp.GetString() == "success")
            {
                var token = root.GetProperty("token").GetString();
                return new PayTrTokenResultDto(
                    Success: true,
                    Token: token,
                    IframeUrl: $"https://www.paytr.com/odeme/guvenli/{token}",
                    ErrorMessage: null
                );
            }
            else
            {
                var reason = root.TryGetProperty("reason", out var reasonProp)
                    ? reasonProp.GetString()
                    : "PayTR token üretilemedi.";

                _logger.LogWarning("PayTR Token failed for Order {OrderNumber}: {Reason}", merchantOid, reason);

                return new PayTrTokenResultDto(
                    Success: false,
                    Token: null,
                    IframeUrl: null,
                    ErrorMessage: reason
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PayTR CreatePayTrPaymentTokenAsync error for order {OrderNumber}", request.OrderNumber);
            return new PayTrTokenResultDto(
                Success: false,
                Token: null,
                IframeUrl: null,
                ErrorMessage: $"PayTR bağlantı hatası: {ex.Message}"
            );
        }
    }

    public bool ValidatePayTrCallback(PayTrCallbackRequestDto callback)
    {
        try
        {
            var payTrSection = _configuration.GetSection("PayTR");
            var merchantKey = payTrSection["MerchantKey"] ?? "";
            var merchantSalt = payTrSection["MerchantSalt"] ?? "";

            if (string.IsNullOrWhiteSpace(merchantKey) || string.IsNullOrWhiteSpace(merchantSalt))
            {
                _logger.LogError("PayTR MerchantKey or MerchantSalt is missing in configuration.");
                return false;
            }

            // PayTR Callback Hash Formula: merchant_oid + merchant_salt + status + total_amount
            var hashStr = $"{callback.MerchantOid}{merchantSalt}{callback.Status}{callback.TotalAmount}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(merchantKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(hashStr));
            var expectedHash = Convert.ToBase64String(hashBytes);

            var isValid = string.Equals(expectedHash, callback.Hash, StringComparison.Ordinal);
            if (!isValid)
            {
                _logger.LogWarning("PayTR Callback hash verification failed for Order {OrderNumber}. Expected: {Expected}, Received: {Received}",
                    callback.MerchantOid, expectedHash, callback.Hash);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating PayTR callback hash for order {OrderNumber}", callback.MerchantOid);
            return false;
        }
    }
}
