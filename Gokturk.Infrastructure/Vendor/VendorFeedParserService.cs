using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;
using Gokturk.Application.Vendor.Abstractions;

namespace Gokturk.Infrastructure.Vendor;

public class VendorFeedParserService : IVendorFeedParserService
{
    private readonly HttpClient _httpClient;

    public VendorFeedParserService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<CategoryFeedDto>> ParseCategoryFeedAsync(string feedUrlOrContent)
    {
        var content = await GetContentAsync(feedUrlOrContent);

        // Auto-detect JSON vs XML
        if (content.TrimStart().StartsWith("{") || content.TrimStart().StartsWith("["))
        {
            return ParseCategoryJson(content);
        }

        return ParseCategoryXml(content);
    }

    public async Task<List<ProductFeedDto>> ParseProductFeedAsync(string feedUrlOrContent)
    {
        var content = await GetContentAsync(feedUrlOrContent);

        // Auto-detect JSON vs XML
        if (content.TrimStart().StartsWith("{") || content.TrimStart().StartsWith("["))
        {
            return ParseProductJson(content);
        }

        return ParseProductXml(content);
    }

    private async Task<string> GetContentAsync(string input)
    {
        if (input.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return await _httpClient.GetStringAsync(input);
        }

        return input;
    }

    #region XML Parsers
    private static List<CategoryFeedDto> ParseCategoryXml(string xmlContent)
    {
        var list = new List<CategoryFeedDto>();
        var doc = XDocument.Parse(xmlContent);

        var elements = doc.Descendants("Kategori");
        foreach (var el in elements)
        {
            var id = el.Element("KategoriID")?.Value?.Trim() ?? string.Empty;
            var parentId = el.Element("ParentID")?.Value?.Trim() ?? "0";
            var name = el.Element("Tanim")?.Value?.Trim() ?? string.Empty;

            if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(name))
            {
                list.Add(new CategoryFeedDto(id, parentId, name));
            }
        }

        return list;
    }

    private static List<ProductFeedDto> ParseProductXml(string xmlContent)
    {
        var list = new List<ProductFeedDto>();
        var doc = XDocument.Parse(xmlContent);

        var elements = doc.Descendants("Urun");
        foreach (var el in elements)
        {
            var id = el.Element("UrunID")?.Value?.Trim() ?? string.Empty;
            var code = el.Element("UrunKod")?.Value?.Trim() ?? string.Empty;
            var name = el.Element("UrunAd")?.Value?.Trim() ?? string.Empty;
            var desc = el.Element("UrunAciklama")?.Value?.Trim() ?? string.Empty;
            var catId = el.Element("UrunKategoriID")?.Value?.Trim() ?? string.Empty;

            var priceStr = el.Element("UrunFiyat")?.Value?.Trim() ?? "0";
            decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var price);

            var stockStr = el.Element("UrunToplamStok")?.Value?.Trim() ?? "0";
            int.TryParse(stockStr, out var stock);

            var unit = el.Element("UrunToplamStokBirim")?.Value?.Trim() ?? "ADET";
            var imageUrl = el.Element("UrunResim1URL")?.Value?.Trim();
            var productUrl = el.Element("UrunSiteURL")?.Value?.Trim();

            if (!string.IsNullOrEmpty(id) && !string.IsNullOrEmpty(name))
            {
                list.Add(new ProductFeedDto(
                    id, code, name, desc, catId, price, unit, stock, imageUrl, productUrl
                ));
            }
        }

        return list;
    }
    #endregion

    #region JSON Parsers
    private static List<CategoryFeedDto> ParseCategoryJson(string jsonContent)
    {
        var list = new List<CategoryFeedDto>();
        using var doc = JsonDocument.Parse(jsonContent);
        var root = doc.RootElement;

        var items = root.ValueKind == JsonValueKind.Array ? root : root.EnumerateObject().First().Value;
        foreach (var el in items.EnumerateArray())
        {
            var id = el.GetProperty("id").ToString();
            var parentId = el.TryGetProperty("parentId", out var p) ? p.ToString() : "0";
            var name = el.GetProperty("name").ToString();

            list.Add(new CategoryFeedDto(id, parentId, name));
        }

        return list;
    }

    private static List<ProductFeedDto> ParseProductJson(string jsonContent)
    {
        var list = new List<ProductFeedDto>();
        using var doc = JsonDocument.Parse(jsonContent);
        var root = doc.RootElement;

        var items = root.ValueKind == JsonValueKind.Array ? root : root.EnumerateObject().First().Value;
        foreach (var el in items.EnumerateArray())
        {
            var id = el.GetProperty("id").ToString();
            var code = el.TryGetProperty("code", out var c) ? c.ToString() : "";
            var name = el.GetProperty("name").ToString();
            var desc = el.TryGetProperty("description", out var d) ? d.ToString() : "";
            var catId = el.TryGetProperty("categoryId", out var ci) ? ci.ToString() : "";
            var price = el.TryGetProperty("price", out var pr) ? pr.GetDecimal() : 0m;
            var unit = el.TryGetProperty("unit", out var u) ? u.ToString() : "Adet";
            var stock = el.TryGetProperty("stock", out var st) ? st.GetInt32() : 0;
            var imageUrl = el.TryGetProperty("imageUrl", out var img) ? img.ToString() : null;
            var productUrl = el.TryGetProperty("productUrl", out var pu) ? pu.ToString() : null;

            list.Add(new ProductFeedDto(id, code, name, desc, catId, price, unit, stock, imageUrl, productUrl));
        }

        return list;
    }
    #endregion
}
