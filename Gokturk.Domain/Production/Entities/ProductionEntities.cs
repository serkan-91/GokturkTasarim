using System;
using Gokturk.Domain.Common;

namespace Gokturk.Domain.Production.Entities;

public class PrintFile : BaseEntity, IAggregateRoot
{
    public Guid OrderItemId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FileExtension { get; set; } = string.Empty; // .pdf, .ai, .psd
    public string ProductionStatus { get; set; } = "Uploaded"; // Uploaded, PreflightPassed, InQueue, InPrinting, Completed
    public int ResolutionDpi { get; set; }
    public bool ColorSpaceCmyk { get; set; }
}

public class PreflightLog : BaseEntity
{
    public Guid PrintFileId { get; set; }
    public string CheckType { get; set; } = string.Empty; // Resolution, Bleed, ColorSpace, FontEmbedding
    public bool Passed { get; set; }
    public string WarningOrErrorMessage { get; set; } = string.Empty;
}
