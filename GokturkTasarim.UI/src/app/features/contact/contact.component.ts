import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-page">

      <!-- ── HERO ── -->
      <div class="contact-hero glass-card">
        <div class="hero-bg-decor">
          <span class="dc dc1"></span>
          <span class="dc dc2"></span>
        </div>
        <div class="hero-inner">
          <div class="hero-label">
            <i class="fa-solid fa-headset"></i> Destek Merkezi
          </div>
          <h1>Size Nasıl <span class="gradient-text">Yardımcı Olabiliriz?</span></h1>
          <p>Sipariş durumu, kargo, tasarım veya herhangi bir konuda bize ulaşın. En geç 24 saat içinde geri döneceğiz.</p>
        </div>
      </div>

      <!-- ── Hızlı İletişim Kanalları ── -->
      <div class="channel-strip">
        <a href="https://wa.me/905325182234?text=Merhaba,%20sipari%C5%9Fim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" class="channel-card channel-wa">
          <div class="ch-icon"><i class="fa-brands fa-whatsapp"></i></div>
          <div class="ch-body">
            <strong>WhatsApp</strong>
            <span>Hızlı yanıt, anında destek</span>
          </div>
          <span class="ch-badge">Çevrimiçi</span>
        </a>
        <a href="tel:+905325182234" class="channel-card channel-phone">
          <div class="ch-icon"><i class="fa-solid fa-phone"></i></div>
          <div class="ch-body">
            <strong>Telefon</strong>
            <span>0 532 518 22 34</span>
          </div>
          <span class="ch-badge ch-badge-amber">09:00–18:00</span>
        </a>
        <a href="mailto:info@gokturktasarim.com" class="channel-card channel-mail">
          <div class="ch-icon"><i class="fa-solid fa-envelope"></i></div>
          <div class="ch-body">
            <strong>E-Posta</strong>
            <span>info&#64;gokturktasarim.com</span>
          </div>
          <span class="ch-badge ch-badge-purple">24 saat</span>
        </a>
      </div>

      <!-- ── ANA İÇERİK ─────────────────────────── -->
      <div class="contact-main">

        <!-- SOL: İletişim Bilgileri + Harita -->
        <div class="contact-left">

          <!-- Birleşik İletişim Paneli (2. resim stili) -->
          <div class="info-panel glass-card">
            <div class="panel-header">
              <h3>İletişim Bilgileri</h3>
              <p>Bize aşağıdaki kanallardan da ulaşabilirsiniz</p>
            </div>

            <div class="info-list">
              <div class="info-row">
                <div class="info-row-icon"><i class="fa-solid fa-building"></i></div>
                <div>
                  <span class="info-row-label">Unvan</span>
                  <span class="info-row-val">Göktürk Reklam & Promosyon</span>
                </div>
              </div>

              <div class="info-row">
                <div class="info-row-icon loc"><i class="fa-solid fa-location-dot"></i></div>
                <div>
                  <span class="info-row-label">Adres</span>
                  <span class="info-row-val">Göktürk Merkez Mah. Göktürk Cad.<br>No: 79 Eyüpsultan / İstanbul</span>
                </div>
              </div>

              <div class="info-row">
                <div class="info-row-icon phone"><i class="fa-solid fa-phone"></i></div>
                <div>
                  <span class="info-row-label">Telefon</span>
                  <a href="tel:+905325182234" class="info-row-val link">0 532 518 22 34</a>
                  <a href="tel:+905326668610" class="info-row-val link">0 532 666 86 10</a>
                </div>
              </div>

              <div class="info-row">
                <div class="info-row-icon mail"><i class="fa-solid fa-envelope"></i></div>
                <div>
                  <span class="info-row-label">E-Posta</span>
                  <a href="mailto:info@gokturktasarim.com" class="info-row-val link">info&#64;gokturktasarim.com</a>
                </div>
              </div>

              <div class="info-row">
                <div class="info-row-icon hours"><i class="fa-solid fa-clock"></i></div>
                <div>
                  <span class="info-row-label">Çalışma Saatleri</span>
                  <span class="info-row-val">Hafta içi 09:00 – 18:00</span>
                  <span class="info-row-val muted">Cumartesi 10:00 – 15:00</span>
                </div>
              </div>
            </div>

            <!-- WhatsApp Butonu -->
            <a
              href="https://wa.me/905325182234?text=Merhaba,%20bilgi%20almak%20istiyorum."
              target="_blank"
              class="whatsapp-btn"
            >
              <i class="fa-brands fa-whatsapp"></i>
              <div>
                <span>WhatsApp ile Yazın</span>
                <small>Hızlı teklif ve sipariş için</small>
              </div>
              <i class="fa-solid fa-arrow-right arrow"></i>
            </a>

            <!-- Sosyal Medya -->
            <div class="socials">
              <a href="#" target="_blank" class="social-icon fb" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" target="_blank" class="social-icon ig" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" target="_blank" class="social-icon yt" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
              <a href="#" target="_blank" class="social-icon tk" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
              <a href="https://wa.me/905325182234" target="_blank" class="social-icon wa" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
        </div>

        <!-- SAĞ: İletişim Formu -->
        <div class="contact-form glass-card">
          <div class="form-header">
            <h3><i class="fa-solid fa-paper-plane"></i> Teklif veya Bilgi Talebi</h3>
            <p>Formu doldurun, ekibimiz en kısa sürede size ulaşsın.</p>
          </div>

          <div *ngIf="submitted()" class="success-msg">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Mesajınız alındı!</strong>
              <span>En geç 24 saat içinde geri döneceğiz.</span>
            </div>
          </div>

          <form *ngIf="!submitted()" (ngSubmit)="onSubmit()" class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label>Ad Soyad <span class="req">*</span></label>
                <input type="text" [(ngModel)]="form.name" name="name"
                  class="form-control" placeholder="Ahmet Yılmaz" required />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" [(ngModel)]="form.phone" name="phone"
                  class="form-control" placeholder="05xx xxx xx xx" />
              </div>
            </div>

            <div class="form-group">
              <label>E-Posta <span class="req">*</span></label>
              <input type="email" [(ngModel)]="form.email" name="email"
                class="form-control" placeholder="ornek@sirket.com" required />
            </div>

            <div class="form-group">
              <label>Firma / Kurum Adı</label>
              <input type="text" [(ngModel)]="form.company" name="company"
                class="form-control" placeholder="ABC Ltd. Şti." />
            </div>

            <div class="form-group">
              <label>Hizmet Türü</label>
              <select [(ngModel)]="form.service" name="service" class="form-control">
                <option value="">Seçiniz...</option>
                <option>Kartvizit Baskısı</option>
                <option>Broşür & Katalog</option>
                <option>Tabela & Totem</option>
                <option>Promosyon Ürünleri</option>
                <option>Kurye Hizmeti</option>
                <option>Dijital Baskı</option>
                <option>Diğer</option>
              </select>
            </div>

            <div class="form-group">
              <label>Mesajınız</label>
              <textarea [(ngModel)]="form.message" name="message"
                class="form-control" rows="5"
                placeholder="Projeniz hakkında detay verin; adet, boyut, malzeme tercihleri vb."></textarea>
            </div>

            <!-- Error message from API -->
            <div *ngIf="errorMsg" class="error-msg">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>{{ errorMsg }}</span>
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
              <i class="fa-solid" [ngClass]="loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              {{ loading ? 'Gönderiliyor...' : 'Mesaj Gönder' }}
            </button>

            <p class="form-note">
              <i class="fa-solid fa-lock"></i>
              Bilgileriniz üçüncü şahıslarla paylaşılmaz.
            </p>
          </form>
        </div>
      </div>

      <!-- ── TAM GENİŞLİK HARİTA ──────────────────────── -->
      <div class="map-full glass-card">
        <div class="map-full-header">
          <div class="map-full-title">
            <i class="fa-solid fa-map-location-dot"></i>
            <div>
              <h3>Konumumuz</h3>
              <p>Göktürk Merkez Mah. Göktürk Cad. No: 79 Eyüpsultan / İstanbul</p>
            </div>
          </div>
          <a
            href="https://maps.google.com/?q=Göktürk+Cad+No+79+Eyüpsultan+İstanbul"
            target="_blank"
            class="btn btn-secondary btn-sm-map"
          >
            <i class="fa-solid fa-diamond-turn-right"></i> Yol Tarifi Al
          </a>
        </div>
        <div class="map-full-wrapper">
          <iframe
            src="https://maps.google.com/maps?q=G%C3%B6kt%C3%BCrk+Cad+No+79+Eyu%CC%88psultan+%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Error Msg */
    .error-msg {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: var(--status-danger);
      font-size: 0.86rem;
    }

    /* Contact Page Styles */
    .contact-page { display: flex; flex-direction: column; gap: 28px; }

    /* ── Quick Channel Strip ── */
    .channel-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    @media (max-width: 768px) { .channel-strip { grid-template-columns: 1fr; } }
    .channel-card {
      display: flex; align-items: center; gap: 14px; padding: 18px 20px;
      border-radius: var(--radius-lg); text-decoration: none; border: 1.5px solid var(--glass-border);
      transition: all 0.25s ease; position: relative; overflow: hidden;
    }
    .channel-card:hover { transform: translateY(-3px); }
    .channel-wa { background: linear-gradient(135deg, rgba(37,211,102,0.12), rgba(18,140,126,0.06)); border-color: rgba(37,211,102,0.25); }
    .channel-wa:hover { border-color: rgba(37,211,102,0.5); box-shadow: 0 8px 24px rgba(37,211,102,0.2); }
    .channel-phone { background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.05)); border-color: rgba(6,182,212,0.25); }
    .channel-phone:hover { border-color: rgba(6,182,212,0.5); box-shadow: 0 8px 24px rgba(6,182,212,0.2); }
    .channel-mail { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.05)); border-color: rgba(99,102,241,0.25); }
    .channel-mail:hover { border-color: rgba(99,102,241,0.5); box-shadow: 0 8px 24px rgba(99,102,241,0.2); }
    .ch-icon {
      width: 44px; height: 44px; border-radius: var(--radius-md); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .channel-wa .ch-icon { background: rgba(37,211,102,0.18); color: #25D366; }
    .channel-phone .ch-icon { background: rgba(6,182,212,0.18); color: var(--secondary); }
    .channel-mail .ch-icon { background: rgba(99,102,241,0.18); color: var(--primary); }
    .ch-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .ch-body strong { font-size: 0.92rem; font-weight: 800; color: var(--text-main); }
    .ch-body span { font-size: 0.76rem; color: var(--text-muted); }
    .ch-badge {
      font-size: 0.65rem; font-weight: 800; padding: 3px 8px; border-radius: 99px;
      background: rgba(37,211,102,0.15); color: #25D366; border: 1px solid rgba(37,211,102,0.3);
      white-space: nowrap;
    }
    .ch-badge-amber { background: rgba(245,158,11,0.15); color: #f59e0b; border-color: rgba(245,158,11,0.3); }
    .ch-badge-purple { background: rgba(99,102,241,0.15); color: var(--primary); border-color: rgba(99,102,241,0.3); }


    /* ── HERO ── */
    .contact-hero {
      padding: 44px 48px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(99,102,241,0.1) 100%) !important;
      border-color: var(--glass-border-hover) !important;
    }

    .hero-bg-decor { position: absolute; inset: 0; pointer-events: none; }

    .dc {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      opacity: 0.12;
    }

    .dc1 { width: 300px; height: 300px; background: var(--secondary); top: -80px; right: -40px; }
    .dc2 { width: 180px; height: 180px; background: var(--primary); bottom: -40px; left: 15%; }

    .hero-inner { position: relative; z-index: 1; }

    .hero-label {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 14px;
      background: rgba(6,182,212,0.18);
      border: 1px solid rgba(6,182,212,0.3);
      border-radius: 9999px;
      color: var(--secondary);
      font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em;
      margin-bottom: 16px;
    }

    .contact-hero h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; }
    .contact-hero p { font-size: 0.95rem; color: var(--text-muted); max-width: 560px; line-height: 1.7; margin: 0; }

    /* ── MAIN GRID ── */
    .contact-main {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .contact-main { grid-template-columns: 1fr; }
    }

    .contact-left {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── INFO PANEL (2. resim stili) ── */
    .info-panel {
      padding: 0;
      overflow: hidden;
    }

    .panel-header {
      padding: 22px 24px 16px;
      border-bottom: 1px solid var(--glass-border);
    }

    .panel-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .panel-header p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    .info-list {
      display: flex;
      flex-direction: column;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--glass-border);
      transition: background 0.2s ease;
    }

    .info-row:hover { background: rgba(255,255,255,0.03); }

    .info-row-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: rgba(99,102,241,0.15);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .info-row-icon.loc { background: rgba(16,185,129,0.15); color: var(--accent-emerald); }
    .info-row-icon.phone { background: rgba(6,182,212,0.15); color: var(--secondary); }
    .info-row-icon.mail { background: rgba(168,85,247,0.15); color: var(--accent-purple); }
    .info-row-icon.hours { background: rgba(245,158,11,0.15); color: #f59e0b; }

    .info-row-label {
      display: block;
      font-size: 0.72rem;
      color: var(--text-dim);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .info-row-val {
      display: block;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.5;
    }

    .info-row-val.muted { color: var(--text-muted); font-weight: 400; }

    a.info-row-val.link {
      color: var(--text-main);
      transition: color 0.2s;
    }

    a.info-row-val.link:hover { color: var(--primary); }

    /* WhatsApp Btn */
    .whatsapp-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 16px 20px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #25D366, #128C7E);
      border-radius: var(--radius-md);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 6px 20px rgba(37,211,102,0.25);
    }

    .whatsapp-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(37,211,102,0.35);
    }

    .whatsapp-btn > .fa-brands {
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .whatsapp-btn div {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .whatsapp-btn small { font-size: 0.75rem; opacity: 0.85; font-weight: 400; }

    .whatsapp-btn .arrow { font-size: 0.85rem; opacity: 0.7; }

    /* Socials */
    .socials {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 24px 20px;
    }

    .social-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
      color: #fff;
    }

    .social-icon:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.25); }

    .fb { background: #1877F2; }
    .ig { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
    .yt { background: #FF0000; }
    .tk { background: #000000; }
    .wa { background: #25D366; }

    /* ── FULL-WIDTH MAP ── */
    .map-full {
      padding: 0;
      overflow: hidden;
    }

    .map-full-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 28px;
      border-bottom: 1px solid var(--glass-border);
    }

    .map-full-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .map-full-title i {
      font-size: 1.4rem;
      color: var(--accent-emerald);
      flex-shrink: 0;
    }

    .map-full-title h3 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 3px;
    }

    .map-full-title p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    .btn-sm-map {
      padding: 8px 18px;
      font-size: 0.82rem;
      flex-shrink: 0;
    }

    .map-full-wrapper {
      width: 100%;
      height: 440px;
    }

    .map-full-wrapper iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      filter: saturate(0.85) contrast(1.05);
    }

    /* ── FORM ── */
    .contact-form {
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-header h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .form-header h3 i { color: var(--secondary); }

    .form-header p {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
    }

    .form-body { display: flex; flex-direction: column; gap: 16px; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

    .form-group { display: flex; flex-direction: column; gap: 6px; }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .req { color: var(--accent-pink); }

    .form-control {
      padding: 11px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-control:focus {
      border-color: var(--secondary);
      box-shadow: 0 0 10px rgba(6,182,212,0.15);
    }

    select.form-control option { background: var(--bg-tertiary); }
    textarea.form-control { resize: vertical; min-height: 110px; }

    .btn-block { width: 100%; justify-content: center; padding: 13px; font-size: 0.95rem; }

    .form-note {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-dim);
      margin: 0;
      justify-content: center;
    }

    .success-msg {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      padding: 20px;
      border-radius: var(--radius-md);
    }

    .success-msg i { font-size: 1.8rem; color: var(--accent-emerald); flex-shrink: 0; }

    .success-msg div {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .success-msg strong { color: var(--accent-emerald); font-size: 0.95rem; }
    .success-msg span { color: var(--text-muted); font-size: 0.85rem; }
  `]
})
export class ContactComponent {
  private apiService = inject(ApiService);

  submitted = signal(false);
  loading = false;
  errorMsg = '';

  form = {
    name: '',
    phone: '',
    email: '',
    company: '',
    service: '',
    message: ''
  };

  onSubmit() {
    if (!this.form.name || !this.form.email) return;

    this.loading = true;
    this.errorMsg = '';

    this.apiService.submitContactForm(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.isSuccess !== false) {
          this.submitted.set(true);
          this.form = { name: '', phone: '', email: '', company: '', service: '', message: '' };
        } else {
          this.errorMsg = res.message || 'Gönderim başarısız. Lütfen tekrar deneyin.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.';
      }
    });
  }
}
