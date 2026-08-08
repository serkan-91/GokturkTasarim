using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Gokturk.Application.Sales.Abstractions;

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
        group.MapPost("/paytr-token", async (CreatePayTrTokenRequestDto request, IPaymentGatewayService paymentService) =>
        {
            if (request.Amount <= 0)
            {
                return Results.BadRequest(new { message = "Tutar 0'dan büyük olmalıdır." });
            }

            var result = await paymentService.CreatePayTrPaymentTokenAsync(request);
            return Results.Ok(result);
        });
    }
}
