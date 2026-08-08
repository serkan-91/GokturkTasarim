using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Gokturk.Application.Sales.Commands;
using Gokturk.Persistence.Contexts;

namespace GokturkTasarim.API.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").WithTags("Orders");

        group.MapPost("/", async (CreateOrderCommand command, IMediator mediator) =>
        {
            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(detail: ex.Message, statusCode: 500);
            }
        })
        .WithName("CreateOrder")
        .WithSummary("Siparişi kaydeder ve stokları günceller.")
        .Produces<CreateOrderResultDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);

        app.MapGet("/api/customer/orders", async (GokturkDbContext db) =>
        {
            var orders = await db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    id = o.Id.ToString(),
                    title = o.Items.FirstOrDefault() != null ? o.Items.FirstOrDefault()!.ProductName : "Reklam & Tasarım Siparişi",
                    code = o.OrderNumber,
                    date = o.CreatedAt.ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                    status = o.OrderStatus == "PendingPayment" ? "Onay Bekliyor" : o.OrderStatus,
                    statusClass = "badge-warning"
                })
                .ToListAsync();

            return Results.Ok(orders);
        })
        .WithName("GetCustomerOrders")
        .WithTags("Customer");

        app.MapGet("/api/orders/{orderCode}/invoice", (string orderCode) =>
        {
            var codeNum = orderCode.Replace("GKT-ORD-", "").Replace("ORD-", "");
            var todayStr = DateTime.Now.ToString("dd.MM.yyyy");

            var invoice = new
            {
                id = $"inv-{DateTime.Now.Ticks}",
                invoiceNumber = $"GKT-FTR-{codeNum}",
                orderCode = orderCode,
                issueDate = todayStr,
                sellerTitle = "Göktürk Reklam & Tasarım San. Tic. Ltd. Şti.",
                sellerTaxDept = "Maslak V.D.",
                sellerTaxNo = "1920839412",
                buyerName = "Değerli Müşterimiz",
                buyerCompany = "Göktürk Müşterisi Ltd. Şti.",
                buyerTaxDept = "Eyüpsultan V.D.",
                buyerTaxNo = "4810293812",
                buyerAddress = "Göktürk Merkez Mah. İstanbul Cad. No:79 Eyüpsultan / İstanbul",
                items = new[]
                {
                    new { productName = "Reklam & Tasarım Üretim Hizmeti", quantity = 1, unitPrice = 1250.0m, taxRate = 20, totalPrice = 1250.0m }
                },
                subTotal = 1250.0m,
                taxTotal = 250.0m,
                discountTotal = 0.0m,
                grandTotal = 1500.0m,
                paymentStatus = "ÖDENDİ",
                paymentMethod = "Kredi Kartı / Havale"
            };

            return Results.Ok(invoice);
        })
        .WithName("GetOrderInvoice")
        .WithTags("Invoices");
    }
}

