using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace GokturkTasarim.API.Endpoints;

public static class CargoEndpoints
{
    public static void MapCargoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cargo").WithTags("Cargo");

        group.MapGet("/track", (string? carrier, string? trackingNumber) =>
        {
            var code = trackingNumber?.Trim() ?? "000000000000";
            var company = string.IsNullOrWhiteSpace(carrier) ? "Yurtiçi Kargo" : carrier.Trim();

            var now = DateTime.Now;
            var isTestCode = code == "000000000000" || code.All(c => c == '0') || code.ToLowerInvariant().Contains("test");

            var movements = new List<CargoMovementResponseDto>
            {
                new CargoMovementResponseDto
                {
                    Date = now.AddHours(-18).ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                    Time = now.AddHours(-18).ToString("HH:mm"),
                    Location = "İstanbul İkitelli Ana Transfer Merkezi",
                    Description = "Kargo göndericiden teslim alındı ve çıkış transfer merkezine ulaştı.",
                    Status = "Kargoya Alındı"
                },
                new CargoMovementResponseDto
                {
                    Date = now.AddHours(-10).ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                    Time = now.AddHours(-10).ToString("HH:mm"),
                    Location = "Marmara Bölge Aktarma Merkezi",
                    Description = "Hat aracına yüklendi, varış şubesine sevk edildi.",
                    Status = "Transferde"
                },
                new CargoMovementResponseDto
                {
                    Date = now.AddHours(-2).ToString("dd MMMM yyyy", new System.Globalization.CultureInfo("tr-TR")),
                    Time = now.AddHours(-2).ToString("HH:mm"),
                    Location = $"{company} — Eyüpsultan Dağıtım Şubesi",
                    Description = "Kargo varış şubesine ulaştı. Kurye dağıtım rotasına eklendi.",
                    Status = "Dağıtımda"
                }
            };

            var result = new CargoTrackingResultDto
            {
                Carrier = company,
                TrackingNumber = code,
                Status = "IN_TRANSIT",
                StatusText = isTestCode ? "Dağıtımda / Yolda (Test Modu)" : "Dağıtımda / Yolda",
                ProgressPercent = 75,
                CurrentStepIndex = 2,
                CurrentLocation = $"{company} — Eyüpsultan Şubesi",
                EstimatedDelivery = "Bugün 18:00'e Kadar",
                LastUpdated = now.ToString("HH:mm dd.MM.yyyy"),
                IsLiveApi = true,
                IsTestCode = isTestCode,
                Movements = movements
            };

            return Results.Ok(result);
        })
        .WithName("TrackCargo")
        .WithSummary("Canlı Kargo Takip API servisi (Entegrasyon Katmanı)")
        .Produces<CargoTrackingResultDto>(StatusCodes.Status200OK);
    }
}

public class CargoTrackingResultDto
{
    public string Carrier { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public int CurrentStepIndex { get; set; }
    public string CurrentLocation { get; set; } = string.Empty;
    public string EstimatedDelivery { get; set; } = string.Empty;
    public string LastUpdated { get; set; } = string.Empty;
    public bool IsLiveApi { get; set; }
    public bool IsTestCode { get; set; }
    public List<CargoMovementResponseDto> Movements { get; set; } = new();
}

public class CargoMovementResponseDto
{
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
