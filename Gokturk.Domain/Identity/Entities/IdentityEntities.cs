using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Identity.Entities;

public class User : BaseEntity, IAggregateRoot
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // Admin, Customer
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsEmailVerified { get; set; } = false;

    public Guid? B2BCompanyProfileId { get; set; }
    public B2BCompanyProfile? B2BCompanyProfile { get; set; }
}

public class B2BCompanyProfile : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string TaxOffice { get; set; } = string.Empty;
    public decimal DiscountRatePercent { get; set; }
}
