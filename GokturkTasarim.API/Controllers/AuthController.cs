using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Gokturk.Application.Common.Interfaces;
using Gokturk.Domain.Identity.Entities;
using Gokturk.Infrastructure.Authentication;
using Gokturk.Infrastructure.Services;
using Gokturk.Persistence.Contexts;

namespace GokturkTasarim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GokturkDbContext _db;
    private readonly IJwtTokenService _jwtService;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly INotificationService _notificationService;
    private readonly IMemoryCache _memoryCache;

    private const string AccessTokenCookieName = "X-Access-Token";
    private const string RefreshTokenCookieName = "X-Refresh-Token";

    public AuthController(
        GokturkDbContext db,
        IJwtTokenService jwtService,
        IEmailTemplateService emailTemplateService,
        INotificationService notificationService,
        IMemoryCache memoryCache)
    {
        _db = db;
        _jwtService = jwtService;
        _emailTemplateService = emailTemplateService;
        _notificationService = notificationService;
        _memoryCache = memoryCache;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "E-posta ve şifre zorunludur." });

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Geçersiz e-posta veya şifre." });

        if (!user.IsActive)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Hesabınız pasife alınmıştır." });

        // Enforce Email Verification for non-Admin users
        if (!user.IsEmailVerified && !string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "E-posta adresiniz henüz doğrulanmamıştır. Lütfen e-postanıza gelen onay bağlantısına tıklayın.",
                requiresEmailVerification = true,
                email = user.Email
            });
        }

        // Generate Access & Refresh Tokens
        var (accessToken, accessExpiresAt) = _jwtService.GenerateAccessToken(user);
        var refreshTokenValue = _jwtService.GenerateRefreshToken();

        // Save RefreshToken to DB
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1"
        };
        await _db.RefreshTokens.AddAsync(refreshTokenEntity);
        await _db.SaveChangesAsync();

        // Set HttpOnly Cookies (Security Policy: XSS Protected)
        SetAuthCookies(accessToken, accessExpiresAt, refreshTokenValue, refreshTokenEntity.ExpiresAt);

        return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.IsEmailVerified));
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "E-posta adresi zorunludur." });

        var emailClean = dto.Email.Trim().ToLower();

        // Rate Limiting (Anti-DDoS): 60 saniyelik IP + E-posta koruması
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var cacheKey = $"ResendEmailCooldown:{emailClean}:{ip}";

        if (_memoryCache.TryGetValue(cacheKey, out _))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                message = "Güvenlik kısıtlaması: Lütfen tekrar e-posta istemeden önce 60 saniye bekleyin."
            });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailClean);
        if (user == null)
        {
            return Ok(new { message = "Eğer e-posta adresi sistemimizde kayıtlı ise doğrulama e-postası tekrar gönderilmiştir." });
        }

        if (user.IsEmailVerified)
        {
            return BadRequest(new { message = "Bu e-posta adresi zaten doğrulanmıştır. Giriş yapabilirsiniz." });
        }

        // Set 60 seconds cooldown in memory cache
        _memoryCache.Set(cacheKey, true, TimeSpan.FromSeconds(60));

        // Eski kullanılmamış doğrulama tokenlarını iptal et
        var oldTokens = await _db.EmailVerificationTokens
            .Where(v => v.UserId == user.Id && !v.IsUsed)
            .ToListAsync();
        foreach (var t in oldTokens)
        {
            t.IsUsed = true;
        }

        // Yeni token üret
        var verificationTokenStr = Guid.NewGuid().ToString("N");
        var verificationToken = new EmailVerificationToken
        {
            UserId = user.Id,
            Token = verificationTokenStr,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
        await _db.EmailVerificationTokens.AddAsync(verificationToken);
        await _db.SaveChangesAsync();

        var origin = Request.Headers["Origin"].FirstOrDefault() ?? "https://gokturkpromosyon.com";
        var verifyUrl = $"{origin}/verify-email?token={verificationTokenStr}";
        var htmlTemplate = _emailTemplateService.GenerateEmailVerificationHtml(user.FullName, verifyUrl);

        await _notificationService.SendEmailNotificationAsync(
            user.Email,
            "Göktürk Tasarım - E-Posta Adresinizi Doğrulayın",
            htmlTemplate
        );

        return Ok(new { message = "Yeni doğrulama e-postası başarıyla gönderildi. Lütfen e-posta kutunuzu kontrol edin." });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest(new { message = "Tüm alanlar zorunludur." });

        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());
        if (exists)
            return BadRequest(new { message = "Bu e-posta adresi zaten kayıtlı." });

        var newUser = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Customer",
            Phone = dto.Phone?.Trim() ?? string.Empty,
            IsActive = true,
            IsEmailVerified = false
        };

        await _db.Users.AddAsync(newUser);

        // Generate Email Verification Token
        var verificationTokenStr = Guid.NewGuid().ToString("N");
        var verificationToken = new EmailVerificationToken
        {
            UserId = newUser.Id,
            Token = verificationTokenStr,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
        await _db.EmailVerificationTokens.AddAsync(verificationToken);
        await _db.SaveChangesAsync();

        // Build Email Verification Link & HTML Template
        var origin = Request.Headers["Origin"].FirstOrDefault() ?? "https://gokturkpromosyon.com";
        var verifyUrl = $"{origin}/verify-email?token={verificationTokenStr}";
        var htmlTemplate = _emailTemplateService.GenerateEmailVerificationHtml(newUser.FullName, verifyUrl);

        // Send Email via MailKit asynchronously
        await _notificationService.SendEmailNotificationAsync(
            newUser.Email,
            "Göktürk Tasarım - E-Posta Adresinizi Doğrulayın",
            htmlTemplate
        );

        return Ok(new
        {
            message = "Kullanıcı kaydı başarılı. Lütfen e-posta adresinizi doğrulayın.",
            verificationUrl = verifyUrl,
            emailHtmlPreview = htmlTemplate
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Refresh token bulunamadı." });

        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
            return Unauthorized(new { message = "Geçersiz veya süresi dolmuş refresh token." });

        var user = await _db.Users.FindAsync(storedToken.UserId);
        if (user == null || !user.IsActive)
            return Unauthorized(new { message = "Kullanıcı bulunamadı veya pasif." });

        // Revoke current token
        storedToken.MarkAsDeleted();
        storedToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        storedToken.RevokedAt = DateTime.UtcNow;

        // Generate new Access & Refresh Token pair (Token Rotation Security)
        var (newAccessToken, accessExpiresAt) = _jwtService.GenerateAccessToken(user);
        var newRefreshTokenValue = _jwtService.GenerateRefreshToken();

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1"
        };
        await _db.RefreshTokens.AddAsync(newRefreshTokenEntity);
        await _db.SaveChangesAsync();

        // Update HttpOnly Cookies
        SetAuthCookies(newAccessToken, accessExpiresAt, newRefreshTokenValue, newRefreshTokenEntity.ExpiresAt);

        return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.IsEmailVerified));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[RefreshTokenCookieName];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var storedToken = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
            if (storedToken != null)
            {
                storedToken.MarkAsDeleted();
                storedToken.RevokedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        // Clear HttpOnly Cookies
        Response.Cookies.Delete(AccessTokenCookieName, GetCookieOptions());
        Response.Cookies.Delete(RefreshTokenCookieName, GetCookieOptions());

        return Ok(new { message = "Oturum başarıyla kapatıldı." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
            return Unauthorized();

        return Ok(new UserDto(user.Id, user.FullName, user.Email, user.Role, user.IsEmailVerified));
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Token zorunludur." });

        var verificationToken = await _db.EmailVerificationTokens
            .FirstOrDefaultAsync(v => v.Token == token && !v.IsUsed && v.ExpiresAt > DateTime.UtcNow);

        if (verificationToken == null)
            return BadRequest(new { message = "Geçersiz veya süresi dolmuş doğrulama bağlantısı." });

        verificationToken.IsUsed = true;
        var user = await _db.Users.FindAsync(verificationToken.UserId);
        if (user != null)
        {
            user.IsEmailVerified = true;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "E-posta adresiniz başarıyla doğrulandı!" });
    }

    private void SetAuthCookies(string accessToken, DateTime accessExpiresAt, string refreshToken, DateTime refreshExpiresAt)
    {
        var cookieOpts = GetCookieOptions();

        Response.Cookies.Append(AccessTokenCookieName, accessToken, new CookieOptions
        {
            HttpOnly = cookieOpts.HttpOnly,
            Secure = cookieOpts.Secure,
            SameSite = cookieOpts.SameSite,
            Expires = accessExpiresAt
        });

        Response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = cookieOpts.HttpOnly,
            Secure = cookieOpts.Secure,
            SameSite = cookieOpts.SameSite,
            Expires = refreshExpiresAt
        });
    }

    private static CookieOptions GetCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true, // Set to true for HTTPS
        SameSite = SameSiteMode.Lax
    };
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string FullName, string Email, string Password, string? Phone);
public record ResendVerificationRequest(string Email);
public record UserDto(Guid Id, string FullName, string Email, string Role, bool IsEmailVerified);
