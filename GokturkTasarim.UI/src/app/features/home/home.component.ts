import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductGroupService } from '../../core/services/product-group.service';
import { ProductGroupPreviewDto } from '../../core/models/product-group.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">

      <!-- ── HERO (Video + CTA Overlay) ─────────────── -->
      <div class="hero-section">
        <video class="hero-video" autoplay loop muted playsinline preload="auto">
          <source src="/banner.webm" type="video/webm">
          <source src="/banner.mp4" type="video/mp4">
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

      <!-- ── AMAZON TARZI ÜRÜN GRUPLARI KUTUCUKLARI ─────────────── -->
      <div class="section-block amazon-section" *ngIf="productGroups().length > 0">
        <div class="section-head">
          <span class="section-tag"><i class="fa-solid fa-boxes-packing"></i> Öne Çıkan Koleksiyonlar</span>
          <div class="section-head-row">
            <h2>Amazon Tarzı <span class="gradient-text">Ürün Grupları</span></h2>
            <span class="badge badge-primary badge-sm"><i class="fa-solid fa-bolt"></i> Dinamik Gruplar</span>
          </div>
        </div>

        <div class="amazon-cards-grid">
          <div class="amazon-card glass-card" *ngFor="let g of productGroups()">
            
            <!-- Box Header -->
            <div class="amazon-card-head">
              <div class="g-title-row">
                <div class="g-icon-box">
                  <i [class]="g.icon || 'fa-solid fa-layer-group'"></i>
                </div>
                <div>
                  <h3>{{ g.name }}</h3>
                  <span class="g-sub" *ngIf="g.description">{{ g.description }}</span>
                </div>
              </div>
            </div>

            <!-- Box Content Preview (Top 5 Products) -->
            <div class="amazon-preview-grid">
              <a
                *ngFor="let p of g.previewProducts.slice(0, 5)"
                [routerLink]="['/group', g.slug]"
                class="amz-item-card"
                [title]="p.name + ' - ₺' + p.basePrice"
              >
                <div class="amz-img-wrap">
                  <img [src]="p.imageUrl || '/banner.png'" [alt]="p.name" (error)="onImgError($event)" />
                  <span class="amz-price-badge">₺{{ p.basePrice }}</span>
                </div>
                <span class="amz-item-title">{{ p.name }}</span>
              </a>
            </div>

            <!-- Box Footer -->
            <div class="amazon-card-foot">
              <a [routerLink]="['/group', g.slug]" class="amz-see-more">
                Tümünü Gör ({{ g.totalProductsCount }} Ürün) <i class="fa-solid fa-chevron-right"></i>
              </a>
            </div>

          </div>
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

        <!-- Hızlı Erişim + Müşteri Yorumları -->
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

          <!-- Müşteri Yorumları & Güven Kartı -->
          <div class="trust-card glass-card">
            <div class="trust-header">
              <h4><i class="fa-solid fa-star"></i> Müşteri Yorumları</h4>
              <span class="badge badge-success">5.000+ Mutlu Müşteri</span>
            </div>

            <div class="testimonial-list">
              <div class="testimonial">
                <div class="testimonial-stars">
                  <i class="fa-solid fa-star" *ngFor="let s of [1,2,3,4,5]"></i>
                </div>
                <p class="testimonial-text">
                  "Kartvizitlerimi 24 saatte teslim ettiler. Kalite inanılmaz, kesinlikle tavsiye ederim!"
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">AY</div>
                  <div>
                    <span class="author-name">Ahmet Yılmaz</span>
                    <span class="author-role">İşletme Sahibi, İstanbul</span>
                  </div>
                </div>
              </div>

              <div class="testimonial">
                <div class="testimonial-stars">
                  <i class="fa-solid fa-star" *ngFor="let s of [1,2,3,4,5]"></i>
                </div>
                <p class="testimonial-text">
                  "Tabela işimiz için harika tasarım yaptılar. Fiyat-kalite dengesi mükemmel."
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">FK</div>
                  <div>
                    <span class="author-name">Fatma Kaya</span>
                    <span class="author-role">Butik Sahibi, Göktürk</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="trust-stats">
              <div class="trust-stat">
                <span class="tstat-num">14+</span>
                <span class="tstat-lbl">Yıl Deneyim</span>
              </div>
              <div class="tstat-divider"></div>
              <div class="trust-stat">
                <span class="tstat-num">5K+</span>
                <span class="tstat-lbl">Mutlu Müşteri</span>
              </div>
              <div class="tstat-divider"></div>
              <div class="trust-stat">
                <span class="tstat-num">%98</span>
                <span class="tstat-lbl">Memnuniyet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ALT CTA BANNER (FULL WIDTH) ─────────────────────────── -->
      <div class="bottom-cta glass-card">
        <div class="bottom-cta-bg"></div>
        <div class="bottom-cta-content">
          <div class="cta-left">
            <div class="bottom-cta-icon">
              <i class="fa-solid fa-comments"></i>
            </div>
            <div class="cta-text">
              <h3>Hayalinizdeki Projeyi Birlikte Hayata Geçirelim</h3>
              <p>Özel ebat baskı, kurumsal matbaa veya kurye ihtiyaçlarınız için 7/24 hızlı fiyat teklifi alın.</p>
            </div>
          </div>
          <div class="bottom-cta-actions">
            <a href="tel:+905325182234" class="btn btn-primary cta-btn-phone">
              <i class="fa-solid fa-phone"></i> 0 532 518 22 34
            </a>
            <a href="https://wa.me/905325182234?text=Merhaba,%20bilgi%20almak%20istiyorum." target="_blank" class="btn-whatsapp cta-btn-wa">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp'tan Fiyat Al
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

    /* ── HERO ── */
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

    .hero-overlay-dark {
      position: absolute; inset: 0; background: rgba(0, 0, 0, 0.35); pointer-events: none;
    }

    .hero-overlay-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 40%, transparent 70%);
      pointer-events: none;
    }

    .hero-cta-overlay { position: relative; z-index: 10; width: 100%; padding: 48px 52px; }
    .hero-cta-inner { display: flex; flex-direction: column; gap: 32px; max-width: 700px; }
    .hero-cta-text { display: flex; flex-direction: column; gap: 14px; }
    .hero-tag {
      display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 800;
      color: #a78bfa; letter-spacing: 0.08em; text-transform: uppercase;
    }
    .hero-title { font-size: 2.8rem; font-weight: 900; line-height: 1.15; margin: 0; color: #ffffff; }
    .hero-subtitle { font-size: 1.05rem; color: rgba(255,255,255,0.82); max-width: 560px; margin: 0; line-height: 1.7; }
    .hero-cta-actions { display: flex; gap: 16px; flex-wrap: wrap; }

    .btn-glass {
      display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px;
      font-size: 0.95rem; font-weight: 700; border-radius: var(--radius-lg);
      border: 1.5px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.12);
      color: #ffffff; backdrop-filter: blur(10px); cursor: pointer; text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-glass:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.55); transform: translateY(-2px); }
    .btn-lg { padding: 15px 32px; font-size: 1rem; }

    .hero-scroll-indicator { display: flex; justify-content: flex-start; }
    .scroll-dot {
      width: 28px; height: 44px; border: 2px solid rgba(255,255,255,0.5); border-radius: 20px; position: relative;
    }
    .scroll-dot::after {
      content: ''; position: absolute; top: 7px; left: 50%; transform: translateX(-50%);
      width: 5px; height: 10px; background: rgba(255,255,255,0.8); border-radius: 4px;
      animation: scrollBounce 1.8s ease-in-out infinite;
    }
    @keyframes scrollBounce { 0%, 100% { top: 7px; opacity: 1; } 50% { top: 18px; opacity: 0.4; } }

    /* ── İSTATİSTİK ŞERİDİ ── */
    .stats-strip {
      padding: 24px 36px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%) !important;
    }
    .stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-num {
      font-size: 2rem; font-weight: 900; font-family: var(--font-heading);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1;
    }
    .stat-lbl { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; text-align: center; }

    /* ── AMAZON TARZI ÜRÜN GRUPLARI (Amazon Feature Box Grid) ── */
    .amazon-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 22px;
    }
    .amazon-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
    }
    .amazon-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
      border-color: rgba(168,85,247,0.35);
    }
    .amazon-card-head { display: flex; align-items: center; justify-content: space-between; }
    .g-title-row { display: flex; align-items: center; gap: 14px; }
    .g-icon-box {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--accent-purple));
      color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
      box-shadow: 0 6px 16px var(--primary-glow); flex-shrink: 0;
    }
    .g-title-row h3 { font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-main); }
    .g-sub { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 2px; }

    .amazon-preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .amz-item-card {
      display: flex; flex-direction: column; gap: 6px;
      text-decoration: none; color: var(--text-main);
      padding: 8px; border-radius: var(--radius-md); background: var(--bg-card);
      border: 1px solid var(--glass-border); transition: all 0.2s ease;
    }
    .amz-item-card:hover {
      border-color: var(--primary); transform: translateY(-2px);
      background: rgba(99,102,241,0.08);
    }
    .amz-img-wrap {
      position: relative; width: 100%; height: 90px;
      border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-secondary);
    }
    .amz-img-wrap img {
      width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;
    }
    .amz-item-card:hover .amz-img-wrap img { transform: scale(1.08); }
    .amz-price-badge {
      position: absolute; bottom: 4px; right: 4px; font-size: 0.65rem; font-weight: 800;
      background: rgba(0,0,0,0.75); color: #a78bfa; padding: 2px 6px; border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .amz-item-title {
      font-size: 0.74rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      color: var(--text-main);
    }

    .amazon-card-foot {
      padding-top: 10px; border-top: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: flex-end;
    }
    .amz-see-more {
      font-size: 0.82rem; font-weight: 800; color: var(--secondary);
      text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
      transition: color 0.2s, transform 0.2s;
    }
    .amz-see-more:hover { color: var(--primary); transform: translateX(3px); }

    /* ── SECTION BLOCK ── */
    .section-block { display: flex; flex-direction: column; gap: 20px; }
    .section-head { display: flex; flex-direction: column; gap: 8px; }
    .section-head-row { display: flex; align-items: center; justify-content: space-between; }
    .section-head-row h2 { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .section-tag {
      display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800;
      color: var(--secondary); letter-spacing: 0.08em; text-transform: uppercase;
    }
    .btn-sm-link { display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; font-size: 0.82rem; }

    /* ── HİZMETLER PREVİEW ── */
    .services-preview {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px;
    }
    .svc-card {
      padding: 24px 20px; display: flex; flex-direction: column; gap: 10px; position: relative;
      cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .svc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.2); }
    .svc-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
    }
    .svc-card h3 { font-size: 0.92rem; font-weight: 700; margin: 0; }
    .svc-card p { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin: 0; flex: 1; }
    .svc-arrow { font-size: 0.8rem; color: var(--primary); opacity: 0; transition: opacity 0.2s, transform 0.2s; }
    .svc-card:hover .svc-arrow { opacity: 1; transform: translateX(4px); }

    /* ── İKİ KOLON ── */
    .two-col-section { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start; }
    @media (max-width: 900px) { .two-col-section { grid-template-columns: 1fr; } }

    .why-card { padding: 30px; display: flex; flex-direction: column; gap: 20px; }
    .why-header h3 { font-size: 1.2rem; font-weight: 800; margin: 0; }
    .why-list { display: flex; flex-direction: column; gap: 14px; }
    .why-row {
      display: flex; align-items: flex-start; gap: 12px; padding-bottom: 14px;
      border-bottom: 1px solid var(--glass-border);
    }
    .why-row:last-child { border-bottom: none; padding-bottom: 0; }
    .why-check {
      width: 26px; height: 26px; border-radius: 50%; background: rgba(16,185,129,0.15);
      color: var(--accent-emerald); display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; flex-shrink: 0; margin-top: 1px;
    }
    .why-row strong { font-size: 0.88rem; font-weight: 700; display: block; margin-bottom: 2px; }
    .why-row p { font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.4; }

    .right-col { display: flex; flex-direction: column; gap: 18px; }
    .quick-links { padding: 22px; }
    .quick-links h4 { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; margin-bottom: 14px; }
    .quick-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .quick-item {
      display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 8px;
      border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-align: center; transition: all 0.2s ease;
    }
    .quick-item i { font-size: 1.2rem; }
    .quick-item:hover { border-color: var(--glass-border-hover); color: var(--primary); transform: translateY(-2px); background: rgba(99,102,241,0.08); }
    .quick-item.accent { border-color: rgba(6,182,212,0.3); color: var(--secondary); }

    .trust-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .trust-header { display: flex; align-items: center; justify-content: space-between; }
    .trust-header h4 { font-size: 0.9rem; font-weight: 700; color: #f59e0b; margin: 0; }
    .testimonial-list { display: flex; flex-direction: column; gap: 12px; }
    .testimonial { padding: 14px; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px; }
    .testimonial-stars i { color: #f59e0b; font-size: 0.7rem; }
    .testimonial-text { font-size: 0.78rem; color: var(--text-muted); line-height: 1.55; margin: 0; font-style: italic; }
    .testimonial-author { display: flex; align-items: center; gap: 10px; }
    .author-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent-purple));
      display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; color: #fff;
    }
    .author-name { font-size: 0.78rem; font-weight: 700; display: block; }
    .author-role { font-size: 0.68rem; color: var(--text-dim); display: block; }

    .trust-stats {
      display: flex; align-items: center; justify-content: space-between; padding: 12px 14px;
      background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.18); border-radius: var(--radius-md);
    }
    .trust-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
    .tstat-num { font-size: 1.2rem; font-weight: 900; font-family: var(--font-heading); color: #f59e0b; }
    .tstat-lbl { font-size: 0.65rem; color: var(--text-dim); font-weight: 600; text-align: center; text-transform: uppercase; }
    .tstat-divider { width: 1px; height: 32px; background: var(--glass-border); }

    /* ── ALT CTA BANNER ── */
    .bottom-cta {
      padding: 36px 44px; position: relative; overflow: hidden;
      background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.12) 50%, rgba(6,182,212,0.1) 100%) !important;
      border: 1px solid rgba(99,102,241,0.3) !important; border-radius: var(--radius-xl);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin-top: 12px;
    }
    .bottom-cta-bg { position: absolute; inset: 0; background: radial-gradient(circle at 90% 50%, rgba(168,85,247,0.2), transparent 70%); pointer-events: none; }
    .bottom-cta-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
    .cta-left { display: flex; align-items: center; gap: 24px; flex: 1; }
    .bottom-cta-icon {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, var(--primary), var(--accent-purple)); color: #fff;
      display: flex; align-items: center; justify-content: center; font-size: 1.7rem; flex-shrink: 0;
    }
    .cta-text h3 { font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; font-family: var(--font-heading); }
    .cta-text p { font-size: 0.9rem; color: var(--text-muted); margin: 0; line-height: 1.5; }
    .bottom-cta-actions { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
    .btn-whatsapp {
      display: inline-flex; align-items: center; gap: 8px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; text-decoration: none; padding: 12px 24px; font-weight: 700;
    }
  `]
})
export class HomeComponent implements OnInit {
  private groupService = inject(ProductGroupService);
  public productGroups = signal<ProductGroupPreviewDto[]>([]);

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

  ngOnInit() {
    this.groupService.getProductGroups().subscribe({
      next: (groups) => this.productGroups.set(groups),
      error: () => this.productGroups.set([])
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="14">Göktürk Baskı</text></svg>';
  }
}
