import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="app-footer">
      <!-- Main Footer Grid -->
      <div class="footer-main">

        <!-- Col 1: Brand -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <img src="logo.jpg" alt="Göktürk Reklam Logo" class="footer-logo-img" />
          </div>
          <p class="brand-tagline">
            İstanbul'un güvenilir reklam, matbaa ve kurye çözüm ortağı.
          </p>
          <p class="brand-desc">
            14+ yıllık sektör deneyimiyle kartvizit baskısından LED tabelaya,
            kurumsal promosyondan aynı gün kurye hizmetine geniş bir yelpazede hizmet veriyoruz.
          </p>
          <div class="footer-socials">
            <a href="#" target="_blank" class="social-btn fb" title="Facebook" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" class="social-btn ig" title="Instagram" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" target="_blank" class="social-btn yt" title="YouTube" aria-label="YouTube">
              <i class="fa-brands fa-youtube"></i>
            </a>
            <a href="#" target="_blank" class="social-btn tk" title="TikTok" aria-label="TikTok">
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a href="https://wa.me/905325182234" target="_blank" class="social-btn wa" title="WhatsApp" aria-label="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        <!-- Col 2: Hızlı Bağlantılar -->
        <div class="footer-col">
          <h4 class="footer-heading">
            <i class="fa-solid fa-compass"></i> Hızlı Bağlantılar
          </h4>
          <ul class="footer-links">
            <li><a routerLink="/" class="footer-link"><i class="fa-solid fa-chevron-right"></i> Ana Sayfa</a></li>
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-chevron-right"></i> Hizmetlerimiz</a></li>
            <li><a routerLink="/about" class="footer-link"><i class="fa-solid fa-chevron-right"></i> Hakkımızda</a></li>
            <li><a routerLink="/contact" class="footer-link"><i class="fa-solid fa-chevron-right"></i> İletişim</a></li>
            <li><a routerLink="/login" class="footer-link"><i class="fa-solid fa-chevron-right"></i> Müşteri Girişi</a></li>
          </ul>
        </div>

        <!-- Col 3: Hizmetlerimiz -->
        <div class="footer-col">
          <h4 class="footer-heading">
            <i class="fa-solid fa-layer-group"></i> Hizmetlerimiz
          </h4>
          <ul class="footer-links">
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-id-card"></i> Kartvizit & Matbaa</a></li>
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-file-lines"></i> Broşür & Katalog</a></li>
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-sign-hanging"></i> Tabela & Totem</a></li>
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-gift"></i> Promosyon Ürünleri</a></li>
            <li><a routerLink="/courier" class="footer-link"><i class="fa-solid fa-truck-fast"></i> Motorlu Kurye & Kargo Takip</a></li>
            <li><a routerLink="/projects" class="footer-link"><i class="fa-solid fa-print"></i> Dijital Baskı</a></li>
          </ul>
        </div>

        <!-- Col 4: İletişim -->
        <div class="footer-col contact-col">
          <h4 class="footer-heading">
            <i class="fa-solid fa-headset"></i> Bize Ulaşın
          </h4>
          <div class="footer-contact-list">
            <a class="footer-contact-item" href="tel:+905325182234">
              <div class="contact-icon phone-icon">
                <i class="fa-solid fa-phone"></i>
              </div>
              <div>
                <span class="contact-label">Telefon</span>
                <span class="contact-val">0 532 518 22 34</span>
              </div>
            </a>
            <a class="footer-contact-item" href="tel:+905326668610">
              <div class="contact-icon phone-icon">
                <i class="fa-solid fa-mobile-screen"></i>
              </div>
              <div>
                <span class="contact-label">İkinci Hat</span>
                <span class="contact-val">0 532 666 86 10</span>
              </div>
            </a>
            <a class="footer-contact-item" href="mailto:info@gokturktasarim.com">
              <div class="contact-icon mail-icon">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div>
                <span class="contact-label">E-Posta</span>
                <span class="contact-val">info&#64;gokturktasarim.com</span>
              </div>
            </a>
            <div class="footer-contact-item">
              <div class="contact-icon loc-icon">
                <i class="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <span class="contact-label">Adres</span>
                <span class="contact-val">Göktürk Merkez Mah. No:79<br>Eyüpsultan / İstanbul</span>
              </div>
            </div>
            <div class="footer-contact-item">
              <div class="contact-icon hours-icon">
                <i class="fa-solid fa-clock"></i>
              </div>
              <div>
                <span class="contact-label">Çalışma Saatleri</span>
                <span class="contact-val">Hafta içi 09:00 – 18:00</span>
                <span class="contact-val muted">Cumartesi 10:00 – 15:00</span>
              </div>
            </div>
          </div>

          <!-- WhatsApp CTA -->
          <a
            href="https://wa.me/905325182234?text=Merhaba,%20bilgi%20almak%20istiyorum."
            target="_blank"
            class="footer-whatsapp-btn"
          >
            <i class="fa-brands fa-whatsapp"></i>
            <span>WhatsApp ile Teklif Al</span>
          </a>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span class="footer-copy">
            © {{ currentYear }} Göktürk Reklam & Promosyon. Tüm Hakları Saklıdır.
          </span>
          <div class="footer-bottom-links">
            <a routerLink="/about" class="bottom-link">Hakkımızda</a>
            <span class="divider">·</span>
            <a routerLink="/contact" class="bottom-link">Gizlilik Politikası</a>
            <span class="divider">·</span>
            <a routerLink="/contact" class="bottom-link">Kullanım Koşulları</a>
          </div>
          <div class="footer-cert">
            <span class="cert-badge">
              <i class="fa-solid fa-shield-halved"></i> Güvenli Ödeme
            </span>
            <span class="cert-badge">
              <i class="fa-solid fa-star"></i> 5.000+ Mutlu Müşteri
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--bg-secondary);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-top: 1px solid var(--glass-border);
      position: relative;
      z-index: 1;
    }

    /* ── MAIN GRID ── */
    .footer-main {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1.4fr;
      gap: 48px;
      padding: 52px 40px 44px;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 1100px) {
      .footer-main { grid-template-columns: 1fr 1fr; gap: 36px; }
    }

    @media (max-width: 640px) {
      .footer-main { grid-template-columns: 1fr; gap: 28px; padding: 36px 24px 28px; }
    }

    /* ── BRAND COL ── */
    .footer-logo-img {
      height: 42px;
      object-fit: contain;
      background: rgba(255, 255, 255, 0.92);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      display: block;
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: transform var(--transition-fast);
    }

    .footer-logo-img:hover { transform: scale(1.03); }

    .brand-tagline {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 10px;
      line-height: 1.4;
    }

    .brand-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin: 0 0 20px;
    }

    /* Social Buttons */
    .footer-socials {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .social-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.92rem;
      color: #fff;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .social-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      color: #fff;
    }

    .fb { background: #1877F2; }
    .ig { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #bc1888); }
    .yt { background: #FF0000; }
    .tk { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.15); }
    .wa { background: #25D366; }

    /* ── HEADINGS ── */
    .footer-heading {
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--primary);
      margin: 0 0 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-heading i { font-size: 0.9rem; }

    /* ── LINKS ── */
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.84rem;
      font-weight: 500;
      text-decoration: none;
      transition: color var(--transition-fast), transform var(--transition-fast);
      padding: 2px 0;
    }

    .footer-link i {
      font-size: 0.65rem;
      color: var(--primary);
      opacity: 0.6;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
    }

    .footer-link:hover {
      color: var(--text-main);
      transform: translateX(4px);
    }

    .footer-link:hover i {
      opacity: 1;
      transform: translateX(2px);
    }

    /* ── CONTACT COL ── */
    .footer-contact-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .footer-contact-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      transition: color var(--transition-fast);
    }

    a.footer-contact-item:hover .contact-val { color: var(--primary); }

    .contact-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .phone-icon { background: rgba(6, 182, 212, 0.15); color: var(--secondary); }
    .mail-icon { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }
    .loc-icon { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
    .hours-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    .contact-label {
      display: block;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: 2px;
    }

    .contact-val {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.4;
    }

    .contact-val.muted {
      color: var(--text-muted);
      font-weight: 400;
    }

    /* WhatsApp CTA */
    .footer-whatsapp-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff;
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.25);
    }

    .footer-whatsapp-btn i { font-size: 1.2rem; }

    .footer-whatsapp-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.38);
      color: #fff;
    }

    /* ── BOTTOM BAR ── */
    .footer-bottom {
      border-top: 1px solid var(--glass-border);
      background: rgba(0, 0, 0, 0.15);
    }

    .footer-bottom-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .footer-bottom-inner {
        flex-direction: column;
        text-align: center;
        padding: 16px 24px;
        gap: 12px;
      }
    }

    .footer-copy {
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .footer-bottom-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bottom-link {
      font-size: 0.76rem;
      color: var(--text-dim);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .bottom-link:hover { color: var(--primary); }

    .divider {
      color: var(--text-dim);
      font-size: 0.7rem;
    }

    .footer-cert {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-dim);
      padding: 3px 10px;
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      letter-spacing: 0.03em;
    }

    .cert-badge i { color: var(--accent-emerald); font-size: 0.75rem; }
  `]
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
