using System.Net;

namespace Gokturk.Infrastructure.Services;

public interface IEmailTemplateService
{
    string GenerateEmailVerificationHtml(string recipientName, string verificationUrl);
}

public class EmailTemplateService : IEmailTemplateService
{
    public string GenerateEmailVerificationHtml(string recipientName, string verificationUrl)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeUrl = WebUtility.HtmlEncode(verificationUrl);

        return $@"
<!DOCTYPE html>
<html lang=""tr"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Göktürk Reklam & Tasarım - E-Posta Doğrulama</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Arial, sans-serif; color: #f3f4f6;"">
    <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""padding: 40px 10px;"">
        <tr>
            <td align=""center"">
                <!-- Main Container -->
                <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width: 600px; background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);"">
                    
                    <!-- Header -->
                    <tr>
                        <td align=""center"" style=""padding: 36px 30px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);"">
                            <h1 style=""margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;"">
                                GÖKTÜRK <span style=""color: #6366f1;"">REKLAM</span>
                            </h1>
                            <p style=""margin: 6px 0 0 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;"">
                                B2B & Reklam Portali
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style=""padding: 40px 36px;"">
                            <h2 style=""margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;"">
                                Merhaba {safeName}, 👋
                            </h2>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #9ca3af;"">
                                Göktürk Reklam & Tasarım ailesine hoş geldiniz! Hesabınızı aktif hale getirmek ve güvenliğinizi doğrulamak için aşağıdaki e-posta doğrulama butonuna tıklayın.
                            </p>

                            <!-- CTA Button -->
                            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin: 30px 0;"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{safeUrl}"" target=""_blank"" style=""display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);"">
                                            E-Posta Adresimi Doğrula
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style=""margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #6b7280;"">
                                Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:
                            </p>
                            <div style=""padding: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; word-break: break-all; font-size: 12px; color: #06b6d4; font-family: monospace;"">
                                {safeUrl}
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""padding: 24px 36px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;"">
                            <p style=""margin: 0 0 8px 0; font-size: 12px; color: #6b7280;"">
                                Göktürk Merkez Mah. Göktürk Cad. No: 79 Eyüpsultan / İstanbul
                            </p>
                            <p style=""margin: 0; font-size: 11px; color: #4b5563;"">
                                Tel: 0 (532) 518 22 34 • info@gokturktasarim.com
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
