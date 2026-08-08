using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Fulfillment.Entities;

public class Shipment : BaseEntity, IAggregateRoot
{
    public Guid OrderId { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public string CarrierCompany { get; set; } = "Göktürk Motorlu Kurye"; // Kurye, Yurtici, Aras, MNG
    public string ShipmentStatus { get; set; } = "Preparing"; // Preparing, InTransit, Delivered, Returned
    public DateTime? DispatchedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public double EstimatedWeightKg { get; set; }
}

public class PackageDetail : BaseEntity
{
    public Guid ShipmentId { get; set; }
    public int PackageNumber { get; set; }
    public double WeightKg { get; set; }
    public string DimensionsCm { get; set; } = string.Empty;
}
