import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ApiHealthStatus } from '../../core/models/api-response.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">

      <!-- ── HERO (Video + CTA Overlay) ─────────────── -->
      <div class="hero-section">
        <video class="hero-video" autoplay loop muted playsinline preload="metadata">
          <source src="banner.webm" type="video/webm">
          <source src="banner.mp4" type="video/mp4">
        </video>
        <!-- Karartma katmanları -->
        <div class="hero-overlay-dark"></div>
        <div class="hero-overlay-gradient"></div>

        <!-- CTA içerik - videonun üzerinde -->
        <div class="hero-cta-overlay">
          <div class="hero-cta-inner">
            <div class="hero-cta-text">
              <span class="hero-tag">
                <i class="fa-solid fa-star"></i> Reklam &bull; Promosyon &bull; Kurye
              </span>
              <h1 class="hero-title">
                Hayalinizdeki Projeyi<br><span class="gradient-text">Birlikte Hayata Geçirelim</span>
              </h1>
              <p class="hero-subtitle">
                Göktürk Reklam olarak hızlı baskı, profesyonel kurye ve yaratıcı promosyon çözümleriyle yanınızdayız.
              </p>
              <div class="hero-cta-actions">
                <a routerLink="/login" class="btn btn-primary btn-lg">
                  <i class="fa-solid fa-right-to-bracket"></i> Hemen Başlayın
                </a>
                <a routerLink="/projects" class="btn btn-glass btn-lg">
                  <i class="fa-solid fa-th-large"></i> Hizmetlerimiz
                </a>
              </div>
            </div>
            <div class="hero-scroll-indicator">
              <div class="scroll-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── İSTATİSTİK ŞERİDİ ─────────────────────── -->
      <div class="stats-strip glass-card">
        <div class="stat-item" *ngFor="let s of stats">
          <span class="stat-num">{{ s.num }}</span>
          <span class="stat-lbl">{{ s.lbl }}</span>
        </div>
      </div>

      <!-- ── HİZMETLER ÖNIZLEME ─────────────────────── -->
      <div class="section-block">
        <div class="section-head">
          <span class="section-tag"><i class="fa-solid fa-layer-group"></i> Hizmetlerimiz</span>
          <div class="section-head-row">
            <h2>Kapsamlı Çözümler, <span class="gradient-text">Tek Adres</span></h2>
            <a routerLink="/projects" class="btn btn-secondary btn-sm-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>

        <div class="services-preview">
          <a routerLink="/projects" class="svc-card glass-card" *ngFor="let s of services">
            <div class="svc-icon" [style.background]="s.bg" [style.color]="s.color">
              <i [class]="s.icon"></i>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
            <span class="svc-arrow"><i class="fa-solid fa-arrow-right"></i></span>
          </a>
        </div>
      </div>

      <!-- ── NEDEN BİZ + API DURUMU ─────────────────── -->
      <div class="two-col-section">

        <!-- Neden Biz -->
        <div class="why-card glass-card">
          <div class="why-header">
            <span class="section-tag"><i class="fa-solid fa-shield-halved"></i> Neden Göktürk?</span>
            <h3>Fark Yaratan <span class="gradient-text">6 Neden</span></h3>
          </div>
          <div class="why-list">
            <div class="why-row" *ngFor="let w of whyUs">
              <div class="why-check"><i class="fa-solid fa-check"></i></div>
              <div>
                <strong>{{ w.title }}</strong>
                <p>{{ w.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hızlı Erişim + API Durum -->
        <div class="right-col">

          <!-- Hızlı Menü -->
          <div class="quick-links glass-card">
            <h4><i class="fa-solid fa-bolt"></i> Hızlı Erişim</h4>
            <div class="quick-grid">
              <a routerLink="/projects" class="quick-item">
                <i class="fa-solid fa-id-card"></i>
                <span>Kartvizit</span>
              </a>
              <a routerLink="/projects" class="quick-item">
                <i class="fa-solid fa-sign-hanging"></i>
                <span>Tabela</span>
              </a>
              <a routerLink="/projects" class="quick-item">
                <i class="fa-solid fa-file-lines"></i>
                <span>Broşür</span>
              </a>
              <a routerLink="/projects" class="quick-item">
                <i class="fa-solid fa-truck-fast"></i>
                <span>Kurye</span>
              </a>
              <a routerLink="/projects" class="quick-item">
                <i class="fa-solid fa-gift"></i>
                <span>Promosyon</span>
              </a>
              <a routerLink="/contact" class="quick-item accent">
                <i class="fa-solid fa-envelope"></i>
                <span>İletişim</span>
              </a>
            </div>
          </div>

          <!-- Sistem Durumu -->
          <div class="status-card glass-card">
            <div class="status-card-header">
              <span><i class="fa-solid fa-circle-dot pulse"></i> Sistem Durumu</span>
              <button class="refresh-btn" (click)="refreshHealth()">
                <i class="fa-solid fa-arrows-rotate"></i>
              </button>
            </div>
            <div class="status-rows">
              <div class="status-row">
                <span class="status-lbl">API Bağlantısı</span>
                <span class="badge" [ngClass]="!healthStatus ? 'badge-warning' : healthStatus.status === 'Offline' ? 'badge-warning' : 'badge-success'">
                  {{ healthStatus?.status || '...' }}
                </span>
              </div>
              <div class="status-row">
                <span class="status-lbl">Veritabanı</span>
                <span class="badge" [ngClass]="!healthStatus ? 'badge-warning' : healthStatus.databaseConnected ? 'badge-success' : 'badge-warning'">
                  {{ !healthStatus ? '...' : healthStatus.databaseConnected ? 'Bağlı' : 'Bağlı Değil' }}
                </span>
              </div>
              <div class="status-row">
                <span class="status-lbl">Ortam</span>
                <span class="badge badge-primary">{{ healthStatus?.environment || '...' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ALT CTA BANNER ─────────────────────────── -->
      <div class="bottom-cta glass-card">
        <div class="bottom-cta-bg"></div>
        <div class="bottom-cta-content">
          <div class="bottom-cta-icon"><i class="fa-solid fa-phone-volume"></i></div>
          <div>
            <h3>Projenizi Konuşalım</h3>
            <p>Ücretsiz danışmanlık ve hızlı teklif için hemen iletişime geçin.</p>
          </div>
          <div class="bottom-cta-actions">
            <a href="tel:+905325182234" class="btn btn-primary">
              <i class="fa-solid fa-phone"></i> 0 532 518 22 34
            </a>
            <a href="https://wa.me/905325182234?text=Merhaba,%20bilgi%20almak%20istiyorum." target="_blank" class="btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .home-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── HERO (Cinematic Video Banner) ── */
    .hero-section {
      position: relative;
      width: 100%;
      min-height: 560px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.45);
      display: flex;
      align-items: flex-end;
    }

    .hero-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      filter: saturate(1.15) brightness(0.85);
    }

    /* Hafif siyah karartma (tüm yüzey) */
    .hero-overlay-dark {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      pointer-events: none;
    }

    /* Alt soldan üste doğru gradient (metin okunabilirliği) */
    .hero-overlay-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.82) 0%,
        rgba(0, 0, 0, 0.45) 40%,
        transparent 70%
      );
      pointer-events: none;
    }

    /* CTA içerik bloğu - videonun önünde */
    .hero-cta-overlay {
      position: relative;
      z-index: 10;
      width: 100%;
      padding: 48px 52px;
    }

    .hero-cta-inner {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 700px;
    }

    .hero-cta-text {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.8rem; font-weight: 800;
      color: #a78bfa; letter-spacing: 0.08em; text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }

    .hero-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1.15;
      margin: 0;
      color: #ffffff;
      text-shadow: 0 2px 16px rgba(0,0,0,0.6);
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.82);
      max-width: 560px;
      margin: 0;
      line-height: 1.7;
      text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    }

    .hero-cta-actions {
      display: flex;
      flex-direction: row;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Cam efektli secondary buton (hero üzerinde) */
    .btn-glass {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px;
      font-size: 0.95rem; font-weight: 700;
      border-radius: var(--radius-lg);
      border: 1.5px solid rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.12);
      color: #ffffff;
      backdrop-filter: blur(10px);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-glass:hover {
      background: rgba(255,255,255,0.22);
      border-color: rgba(255,255,255,0.55);
      transform: translateY(-2px);
    }

    /* Büyük buton varyantı */
    .btn-lg {
      padding: 15px 32px;
      font-size: 1rem;
    }

    /* Scroll göstergesi */
    .hero-scroll-indicator {
      display: flex; justify-content: flex-start;
    }
    .scroll-dot {
      width: 28px; height: 44px;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 20px;
      position: relative;
    }
    .scroll-dot::after {
      content: '';
      position: absolute;
      top: 7px; left: 50%; transform: translateX(-50%);
      width: 5px; height: 10px;
      background: rgba(255,255,255,0.8);
      border-radius: 4px;
      animation: scrollBounce 1.8s ease-in-out infinite;
    }
    @keyframes scrollBounce {
      0%, 100% { top: 7px; opacity: 1; }
      50% { top: 18px; opacity: 0.4; }
    }

    /* ── STATİSTİK ŞERİDİ ── */
    .stats-strip {
      padding: 24px 36px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 20px;
      flex-wrap: wrap;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%) !important;
      border-color: var(--glass-border-hover) !important;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-num {
      font-size: 2rem;
      font-weight: 900;
      font-family: var(--font-heading);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
    }

    .stat-lbl {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
      text-align: center;
    }

    /* ── SECTION ── */
    .section-block { display: flex; flex-direction: column; gap: 20px; }

    .section-head { display: flex; flex-direction: column; gap: 8px; }

    .section-head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-head-row h2 { font-size: 1.6rem; font-weight: 800; margin: 0; }

    .section-tag {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.75rem; font-weight: 800;
      color: var(--secondary); letter-spacing: 0.08em; text-transform: uppercase;
    }

    .btn-sm-link {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 16px; font-size: 0.82rem;
    }

    /* ── HİZMETLER PREVİEW ── */
    .services-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 16px;
    }

    .svc-card {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .svc-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.2);
    }

    .svc-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
    }

    .svc-card h3 { font-size: 0.92rem; font-weight: 700; margin: 0; }

    .svc-card p {
      font-size: 0.78rem; color: var(--text-muted);
      line-height: 1.4; margin: 0; flex: 1;
    }

    .svc-arrow {
      font-size: 0.8rem;
      color: var(--primary);
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
    }

    .svc-card:hover .svc-arrow { opacity: 1; transform: translateX(4px); }

    /* ── İKİ KOLON ── */
    .two-col-section {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .two-col-section { grid-template-columns: 1fr; }
    }

    /* ── NEDEN BİZ ── */
    .why-card {
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .why-header { display: flex; flex-direction: column; gap: 6px; }
    .why-header h3 { font-size: 1.2rem; font-weight: 800; margin: 0; }

    .why-list { display: flex; flex-direction: column; gap: 14px; }

    .why-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--glass-border);
    }
    .why-row:last-child { border-bottom: none; padding-bottom: 0; }

    .why-check {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: rgba(16,185,129,0.15);
      color: var(--accent-emerald);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; flex-shrink: 0;
      margin-top: 1px;
    }

    .why-row strong { font-size: 0.88rem; font-weight: 700; display: block; margin-bottom: 2px; }
    .why-row p { font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.4; }

    /* ── SAĞ KOLON ── */
    .right-col { display: flex; flex-direction: column; gap: 18px; }

    /* Hızlı Erişim */
    .quick-links { padding: 22px; }

    .quick-links h4 {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.88rem; font-weight: 700; margin-bottom: 14px;
    }

    .quick-links h4 i { color: var(--primary); }

    .quick-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .quick-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 8px;
      padding: 14px 8px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 0.75rem; font-weight: 600;
      transition: all 0.2s ease;
      text-align: center;
    }

    .quick-item i { font-size: 1.2rem; }

    .quick-item:hover {
      border-color: var(--glass-border-hover);
      color: var(--primary);
      transform: translateY(-2px);
      background: rgba(99,102,241,0.08);
    }

    .quick-item.accent {
      border-color: rgba(6,182,212,0.3);
      color: var(--secondary);
    }

    .quick-item.accent:hover { background: rgba(6,182,212,0.1); }

    /* Sistem Durumu */
    .status-card { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

    .status-card-header {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 0.85rem; font-weight: 700;
    }

    .status-card-header span {
      display: flex; align-items: center; gap: 8px;
    }

    .pulse { color: var(--accent-emerald); animation: pulse-dot 2s infinite; }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .refresh-btn {
      background: none; border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm);
      color: var(--text-muted); font-size: 0.8rem;
      padding: 4px 9px; cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover { color: var(--secondary); border-color: var(--secondary); }

    .status-rows { display: flex; flex-direction: column; gap: 10px; }

    .status-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 12px;
      background: rgba(255,255,255,0.03);
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
    }

    .status-lbl { color: var(--text-muted); }

    /* ── ALT CTA ── */
    .bottom-cta {
      padding: 32px 40px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.1) 100%) !important;
      border-color: var(--glass-border-hover) !important;
    }

    .bottom-cta-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.15), transparent 60%);
      pointer-events: none;
    }

    .bottom-cta-content {
      position: relative; z-index: 1;
      display: flex; align-items: center; gap: 20px;
    }

    .bottom-cta-icon {
      width: 56px; height: 56px;
      border-radius: var(--radius-md);
      background: rgba(99,102,241,0.2);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }

    .bottom-cta-content > div:nth-child(2) { flex: 1; }
    .bottom-cta-content h3 { font-size: 1.1rem; margin-bottom: 4px; }
    .bottom-cta-content p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

    .bottom-cta-actions { display: flex; gap: 12px; flex-shrink: 0; }

    .btn-whatsapp {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff; font-weight: 700; font-size: 0.9rem;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(37,211,102,0.25);
    }

    .btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37,211,102,0.35);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
      .hero-section { min-height: 420px; }
      .hero-cta-overlay { padding: 28px 24px; }
      .hero-title { font-size: 1.9rem; }
      .hero-subtitle { font-size: 0.9rem; }
      .hero-cta-actions { flex-direction: column; }
      .hero-cta-actions .btn, .hero-cta-actions .btn-glass { width: 100%; justify-content: center; }
      .section-head-row { flex-direction: column; align-items: flex-start; }
      .bottom-cta-content { flex-direction: column; text-align: center; }
      .bottom-cta { padding: 24px; }
      .bottom-cta-actions { width: 100%; flex-direction: column; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  healthStatus: ApiHealthStatus | null = null;

  stats = [
    { num: '14+', lbl: 'Yıl Deneyim' },
    { num: '5.000+', lbl: 'Mutlu Müşteri' },
    { num: '50.000+', lbl: 'Tamamlanan Sipariş' },
    { num: '18+', lbl: 'Hizmet Çeşidi' },
    { num: '1 Gün', lbl: 'Hızlı Teslimat' },
  ];

  services = [
    { icon: 'fa-solid fa-id-card', title: 'Kartvizit', desc: '5 farklı seri, UV spot, folyo & kabartma baskı.', bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)' },
    { icon: 'fa-solid fa-file-lines', title: 'Broşür & Katalog', desc: 'A5 broşürden cepli dosyaya baskı çözümleri.', bg: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' },
    { icon: 'fa-solid fa-sign-hanging', title: 'Tabela & Totem', desc: 'LED, kutu harf, cephe ve totem uygulamaları.', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    { icon: 'fa-solid fa-gift', title: 'Promosyon', desc: 'Kalem, defter, antetli kağıt ve kurumsal set.', bg: 'rgba(168,85,247,0.15)', color: 'var(--accent-purple)' },
    { icon: 'fa-solid fa-truck-fast', title: 'Kurye', desc: 'İstanbul geneli aynı gün motorlu teslimat.', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    { icon: 'fa-solid fa-print', title: 'Dijital Baskı', desc: 'Branda, poster ve roll-up geniş format baskı.', bg: 'rgba(6,182,212,0.15)', color: 'var(--secondary)' },
  ];

  whyUs = [
    { title: 'Hızlı Üretim & Teslimat', desc: 'Sıkı takvim ve kurye ağımızla zamanında teslim garantisi.' },
    { title: 'Kalite Güvencesi', desc: 'Premium malzeme, UV & folyo teknolojileriyle marka değerinizi yansıtıyoruz.' },
    { title: 'Tek Elden Hizmet', desc: 'Tasarımdan baskıya, teslimata kadar tek muhatap.' },
    { title: 'Her Bütçeye Uygun', desc: 'Bireyden kuruma esnek fiyatlandırma modelleri.' },
    { title: 'Şeffaf Fiyatlandırma', desc: 'Sürpriz ek ücret yok; baştan netleştirilmiş fiyat.' },
    { title: '14+ Yıl Deneyim', desc: 'Sektörün her dönüşümünü bizzat yaşayan köklü tecrübe.' },
  ];

  ngOnInit(): void {
    this.refreshHealth();
  }

  refreshHealth(): void {
    this.apiService.checkHealth().subscribe(status => {
      this.healthStatus = status;
    });
  }
}
