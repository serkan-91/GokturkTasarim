namespace Gokturk.Domain.ValueObjects;

public record PrintDimensions(decimal WidthCm, decimal HeightCm)
{
    public decimal SurfaceAreaSqM => (WidthCm * HeightCm) / 10000m;

    public static PrintDimensions Create(decimal width, decimal height)
    {
        if (width <= 0 || height <= 0)
            throw new ArgumentException("Ölçüler 0'dan büyük olmalıdır.");

        return new PrintDimensions(width, height);
    }
}