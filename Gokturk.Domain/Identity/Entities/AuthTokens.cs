using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Identity.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public string CreatedByIp { get; set; } = string.Empty;
    public string? RevokedByIp { get; set; }
    public DateTime? RevokedAt { get; set; }

    public bool IsActive => !IsRevoked && ExpiresAt > DateTime.UtcNow && !IsDeleted;
}

public class EmailVerificationToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
}
