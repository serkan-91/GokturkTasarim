using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Vendor.Entities;

public class VendorFeed : BaseEntity, IAggregateRoot
{
    public string VendorName { get; set; } = string.Empty; // e.g. Promojoy
    public string FeedUrl { get; set; } = string.Empty;
    public DateTime? LastSyncedAt { get; set; }
    public int TotalProductsSynced { get; set; }
    public string SyncStatus { get; set; } = "Idle"; // Idle, Syncing, Completed, Failed
}

public class XmlLog : BaseEntity
{
    public Guid VendorFeedId { get; set; }
    public string LogType { get; set; } = "Info";
    public string Message { get; set; } = string.Empty;
    public string RawXmlSnippet { get; set; } = string.Empty;
}
