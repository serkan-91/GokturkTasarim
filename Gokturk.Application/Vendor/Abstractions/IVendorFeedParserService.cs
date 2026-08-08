using System.Collections.Generic;
using System.Threading.Tasks;

namespace Gokturk.Application.Vendor.Abstractions;

public record CategoryFeedDto(string Id, string ParentId, string Name);

public record ProductFeedDto(
    string Id,
    string Code,
    string Name,
    string Description,
    string CategoryId,
    decimal Price,
    string Unit,
    int Stock,
    string? ImageUrl,
    string? ProductUrl
);

public interface IVendorFeedParserService
{
    Task<List<CategoryFeedDto>> ParseCategoryFeedAsync(string feedUrlOrContent);
    Task<List<ProductFeedDto>> ParseProductFeedAsync(string feedUrlOrContent);
}
