using System;
using System.Globalization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Gokturk.Application.Sales.Abstractions;
using Gokturk.Domain.Sales.Entities;
using Gokturk.Persistence.Contexts;

namespace GokturkTasarim.API.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sales/payments")
            .WithTags("Payments & Banking");

        // 1. Get Corporate Bank Accounts for Havale / EFT / FAST
        group.MapGet("/bank-accounts", (IPaymentGatewayService paymentService) =>
        {
            var accounts = paymentService.GetCorporateBankAccounts();
            return Results.Ok(accounts);
        });

        // 2. Process Bank Transfer Payment & Create Unique Reference Code
        group.MapPost("/bank-transfer", async (CreateBankTransferPaymentRequestDto request, IPaymentGatewayService paymentService) =>
        {
            if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                return Results.BadRequest(new { message = "Müşteri adı ve telefon numarası zorunludur." });
            }

            var result = await paymentService.ProcessBankTransferAsync(request);
            return Results.Ok(result);
        });

        // 3. Create PayTR 3D Secure Credit Card Payment Token
        group.MapPost("/paytr-token", async (
            CreatePayTrTokenRequestDto request,
            HttpContext httpContext,
            IPaymentGatewayService paymentService) =>
        {
            if (request.Amount <= 0)
            {
                return Results.BadRequest(new { message = "Tutar 0'dan büyük olmalıdır." });
            }

            // Client IP tespiti (Nginx X-Forwarded-For veya RemoteIpAddress)
            var clientIp = request.UserIp;
            if (string.IsNullOrWhiteSpace(clientIp))
            {
                if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor) && !string.IsNullOrWhiteSpace(forwardedFor))
                {
                    clientIp = forwardedFor.ToString().Split(',')[0].Trim();
                }
                else
                {
                    clientIp = httpContext.Connection.RemoteIpAddress?.ToString();
                }
            }

            if (string.IsNullOrWhiteSpace(clientIp) || clientIp == "::1" || clientIp == "127.0.0.1")
            {
                clientIp = "127.0.0.1";
            }

            var userId = request.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            }

            var updatedRequest = request with { UserIp = clientIp, UserId = userId };
            var result = await paymentService.CreatePayTrPaymentTokenAsync(updatedRequest);

            return Results.Ok(result);
        });

        // 4. PayTR Webhook Callback (Bildirim URL)
        group.MapGet("/paytr-callback", () => Results.Text("OK", "text/plain"));

        group.MapPost("/paytr-callback", async (
            HttpRequest request,
            IPaymentGatewayService paymentService,
            GokturkDbContext db,
            ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("PayTrCallback");

            try
            {
                if (!request.HasFormContentType)
                {
                    logger.LogInformation("PayTR Ping/Test received without form data.");
                    return Results.Text("OK", "text/plain");
                }

                var form = await request.ReadFormAsync();
                var merchantOid = form["merchant_oid"].ToString();
                var status = form["status"].ToString();
                var totalAmount = form["total_amount"].ToString();
                var hash = form["hash"].ToString();
                var failedReasonCode = form["failed_reason_code"].ToString();
                var failedReasonMsg = form["failed_reason_msg"].ToString();
                var testMode = form["test_mode"].ToString();
                var paymentType = form["payment_type"].ToString();
                var currency = form["currency"].ToString();

                if (string.IsNullOrWhiteSpace(merchantOid))
                {
                    logger.LogInformation("PayTR callback received with empty merchant_oid.");
                    return Results.Text("OK", "text/plain");
                }

                logger.LogInformation("PayTR Callback Received for Order {OrderNumber}: Status={Status}, Amount={Amount}",
                    merchantOid, status, totalAmount);

                var callbackDto = new PayTrCallbackRequestDto(
                    MerchantOid: merchantOid,
                    Status: status,
                    TotalAmount: totalAmount,
                    Hash: hash,
                    FailedReasonCode: failedReasonCode,
                    FailedReasonMsg: failedReasonMsg,
                    TestMode: testMode,
                    PaymentType: paymentType,
                    Currency: currency
                );

                // 1. Hash doğrulama
                var isValidHash = paymentService.ValidatePayTrCallback(callbackDto);
                if (!isValidHash)
                {
                    logger.LogWarning("PayTR Callback invalid hash for order {OrderNumber}", merchantOid);
                    return Results.Text("OK", "text/plain");
                }

                // 2. Sipariş ve Ödeme Güncellemesi
                var order = await db.Orders.FirstOrDefaultAsync(o => o.OrderNumber == merchantOid);
                var amountDecimal = decimal.TryParse(totalAmount, NumberStyles.Any, CultureInfo.InvariantCulture, out var amt)
                    ? amt / 100m
                    : 0m;

                if (status == "success")
                {
                    if (order != null)
                    {
                        order.OrderStatus = "Paid";
                        order.PaymentMethod = "CreditCard_PayTR";
                        order.MarkAsUpdated();
                    }

                    var transaction = await db.PaymentTransactions
                        .FirstOrDefaultAsync(t => t.OrderNumber == merchantOid);

                    if (transaction == null)
                    {
                        transaction = new PaymentTransaction
                        {
                            OrderId = order?.Id ?? Guid.Empty,
                            OrderNumber = merchantOid,
                            PaymentNumber = $"PAYTR-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                            Amount = amountDecimal > 0 ? amountDecimal : (order?.TotalAmount ?? 0),
                            Currency = string.IsNullOrWhiteSpace(currency) ? "TRY" : currency,
                            PaymentMethod = "CreditCard_PayTR",
                            PaymentProvider = "PayTR",
                            Status = "Approved",
                            PayTrToken = hash
                        };
                        db.PaymentTransactions.Add(transaction);
                    }
                    else
                    {
                        transaction.Status = "Approved";
                        transaction.PayTrToken = hash;
                        transaction.MarkAsUpdated();
                    }

                    await db.SaveChangesAsync();
                    logger.LogInformation("PayTR payment success for order {OrderNumber} updated in database.", merchantOid);
                }
                else
                {
                    if (order != null)
                    {
                        order.OrderStatus = "PaymentFailed";
                        order.MarkAsUpdated();
                    }

                    var transaction = await db.PaymentTransactions
                        .FirstOrDefaultAsync(t => t.OrderNumber == merchantOid);

                    if (transaction == null)
                    {
                        transaction = new PaymentTransaction
                        {
                            OrderId = order?.Id ?? Guid.Empty,
                            OrderNumber = merchantOid,
                            PaymentNumber = $"PAYTR-FAIL-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                            Amount = amountDecimal,
                            Currency = string.IsNullOrWhiteSpace(currency) ? "TRY" : currency,
                            PaymentMethod = "CreditCard_PayTR",
                            PaymentProvider = "PayTR",
                            Status = "Failed",
                            ErrorMessage = failedReasonMsg
                        };
                        db.PaymentTransactions.Add(transaction);
                    }
                    else
                    {
                        transaction.Status = "Failed";
                        transaction.ErrorMessage = failedReasonMsg;
                        transaction.MarkAsUpdated();
                    }

                    await db.SaveChangesAsync();
                    logger.LogWarning("PayTR payment failed for order {OrderNumber}: {Reason}", merchantOid, failedReasonMsg);
                }

                // PayTR başarılı işlem aldığında kesinlikle "OK" metni bekler.
                return Results.Text("OK", "text/plain");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Exception in PayTR callback handler.");
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        })
        .DisableAntiforgery(); // PayTR webhook dış sunucudan geldiği için antiforgery devre dışı olmalıdır
    }
}
