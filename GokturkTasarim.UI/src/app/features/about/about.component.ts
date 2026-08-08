import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page">

      <!-- ── HERO SECTION ───────────────────────────── -->
      <div class="about-hero glass-card">
        <div class="hero-bg-decor">
          <span class="decor-circle c1"></span>
          <span class="decor-circle c2"></span>
          <span class="decor-circle c3"></span>
        </div>
        <div class="hero-inner">
          <div class="hero-label">
            <i class="fa-solid fa-building-columns"></i> Göktürk Reklam & Promosyon
          </div>
          <h1>
            İstanbul'un Güvenilir<br>
            <span class="gradient-text">Reklam & Matbaa Ortağı</span>
          </h1>
          <p>
            14 yılı aşkın sektör deneyimiyle kartvizit baskısından LED tabelaya,
            kurumsal promosyon ürünlerinden motorlu kurye hizmetine uzanan
            geniş bir hizmet yelpazesiyle firmalar ve bireyler için değer üretiyoruz.
          </p>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-num">14+</span>
              <span class="stat-lbl">Yıl Deneyim</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">5.000+</span>
              <span class="stat-lbl">Mutlu Müşteri</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">50.000+</span>
              <span class="stat-lbl">Tamamlanan Sipariş</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">İstanbul</span>
              <span class="stat-lbl">Geneli Teslimat</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── BİZ KİMİZ ───────────────────────────────── -->
      <div class="section-block">
        <div class="section-head">
          <span class="section-tag">Kimliğimiz</span>
          <h2>Biz Kimiz?</h2>
        </div>

        <div class="who-grid">
          <div class="who-text glass-card">
            <p>
              Göktürk Reklam olarak yolculuğumuz, küçük bir matbaa atölyesiyle başladı.
              Bugün İstanbul genelinde <strong>kartvizit, broşür, katalog, tabela, totem,
              dijital baskı ve kurumsal promosyon ürünleri</strong> alanlarında tam kapsamlı
              bir hizmet ortağına dönüştük.
            </p>
            <p>
              Standart çözümlerin sınırlarını zorlamayı seven bir ekibiz.
              Her müşterimizin markasını, hedefini ve bütçesini önemseyerek
              <strong>özel, ölçülebilir ve sonuç odaklı</strong> üretimler gerçekleştiriyoruz.
            </p>
            <p>
              Aile şirketi olmaktan gelen sorumluluk duygusuyla, müşterilerimizle
              uzun yılara dayanan güven ilişkileri kuruyoruz.
              Her siparişinizde kendinizi <strong>bir iş ortağına emanet ettiğinizi</strong> hissedebilirsiniz.
            </p>
            <a routerLink="/contact" class="btn btn-primary mt-btn">
              <i class="fa-solid fa-handshake"></i> Bize Ulaşın
            </a>
          </div>

          <div class="who-values">
            <div class="value-pill glass-card" *ngFor="let v of values">
              <div class="vpill-icon" [style.background]="v.bg" [style.color]="v.color">
                <i [class]="v.icon"></i>
              </div>
              <div>
                <h4>{{ v.title }}</h4>
                <p>{{ v.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── HİZMET ALANLARI ─────────────────────────── -->
      <div class="section-block">
        <div class="section-head">
          <span class="section-tag">Ne Yapıyoruz?</span>
          <h2>Hizmet Alanlarımız</h2>
        </div>

        <div class="services-grid">
          <div class="service-card glass-card" *ngFor="let s of services">
            <div class="svc-thumb" [style.background]="s.bg">
              <i [class]="s.icon"></i>
            </div>
            <div class="svc-body">
              <h3>{{ s.title }}</h3>
              <p>{{ s.desc }}</p>
              <ul class="svc-tags">
                <li *ngFor="let t of s.tags" class="tag">{{ t }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- ── NEDEN BİZ ────────────────────────────────── -->
      <div class="section-block why-block glass-card">
        <div class="section-head incard">
          <span class="section-tag">Fark Yaratan Noktalar</span>
          <h2>Neden Göktürk?</h2>
        </div>

        <div class="why-grid">
          <div class="why-item" *ngFor="let w of whyUs; let i = index">
            <span class="why-num">{{ ('0' + (i + 1)).slice(-2) }}</span>
            <div>
              <h4>{{ w.title }}</h4>
              <p>{{ w.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CTA ─────────────────────────────────────── -->
      <div class="about-cta glass-card">
        <div class="cta-left">
          <h3>Projenizi birlikte hayata geçirelim</h3>
          <p>Teklif almak veya detaylı bilgi için hemen iletişime geçin — ücretsiz danışmanlık sunuyoruz.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/contact" class="btn btn-primary">
            <i class="fa-solid fa-paper-plane"></i> Teklif Al
          </a>
          <a routerLink="/projects" class="btn btn-secondary">
            <i class="fa-solid fa-th-large"></i> Katalog
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-page {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* ── HERO ── */
    .about-hero {
      padding: 52px 48px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.1) 100%) !important;
      border-color: var(--glass-border-hover) !important;
    }

    .hero-bg-decor {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .decor-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.15;
      filter: blur(60px);
    }

    .c1 {
      width: 320px; height: 320px;
      background: var(--primary);
      top: -80px; right: -60px;
    }
    .c2 {
      width: 200px; height: 200px;
      background: var(--secondary);
      bottom: -50px; left: 20%;
    }
    .c3 {
      width: 160px; height: 160px;
      background: var(--accent-purple);
      top: 30%; left: -40px;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
    }

    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      background: rgba(99,102,241,0.18);
      border: 1px solid var(--glass-border-hover);
      border-radius: 9999px;
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 18px;
    }

    .about-hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 18px;
    }

    .about-hero p {
      font-size: 1rem;
      color: var(--text-muted);
      max-width: 620px;
      line-height: 1.75;
      margin-bottom: 36px;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-num {
      font-size: 1.9rem;
      font-weight: 800;
      font-family: var(--font-heading);
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-lbl {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: var(--glass-border);
    }

    /* ── SECTION BLOCK ── */
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-head {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-head.incard {
      margin-bottom: 24px;
    }

    .section-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .section-head h2 {
      font-size: 1.7rem;
      font-weight: 800;
      margin: 0;
    }

    /* ── WHO GRID ── */
    .who-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 820px) {
      .who-grid { grid-template-columns: 1fr; }
    }

    .who-text {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .who-text p {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.75;
      margin: 0;
    }

    .who-text strong {
      color: var(--text-main);
    }

    .mt-btn { margin-top: 8px; align-self: flex-start; }

    .who-values {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .value-pill {
      padding: 18px 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .vpill-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .value-pill h4 {
      font-size: 0.9rem;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .value-pill p {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    /* ── SERVICES ── */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .service-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .svc-thumb {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }

    .svc-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .svc-body h3 {
      font-size: 0.98rem;
      font-weight: 700;
      margin: 0;
    }

    .svc-body p {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
    }

    .svc-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      list-style: none;
      padding: 0;
      margin: 4px 0 0;
    }

    .tag {
      font-size: 0.7rem;
      padding: 2px 8px;
      background: rgba(99,102,241,0.12);
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      color: var(--primary);
      font-weight: 600;
    }

    /* ── WHY US ── */
    .why-block {
      padding: 40px;
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 28px;
    }

    .why-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .why-num {
      font-size: 2rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--primary);
      opacity: 0.35;
      line-height: 1;
      flex-shrink: 0;
    }

    .why-item h4 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .why-item p {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }

    /* ── CTA ── */
    .about-cta {
      padding: 36px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.08) 100%) !important;
    }

    .about-cta h3 {
      font-size: 1.25rem;
      margin-bottom: 6px;
    }

    .about-cta p {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin: 0;
    }

    .cta-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .about-hero { padding: 32px 24px; }
      .about-hero h1 { font-size: 1.8rem; }
      .about-cta { flex-direction: column; padding: 28px 24px; }
      .cta-actions { width: 100%; }
      .why-block { padding: 28px 20px; }
    }
  `]
})
export class AboutComponent {
  values = [
    {
      icon: 'fa-solid fa-bolt',
      title: 'Hızlı Teslimat',
      desc: 'Sıkı üretim takvimimiz ve İstanbul geneli kurye ağımızla siparişlerinizi zamanında teslim ediyoruz.',
      bg: 'rgba(99,102,241,0.15)', color: 'var(--primary)'
    },
    {
      icon: 'fa-solid fa-medal',
      title: 'Kalite Odaklı Üretim',
      desc: 'Yüksek gramajlı kuşe, UV spot, folyo ve kabartma gibi premium matbaa teknolojileriyle üretim yapıyoruz.',
      bg: 'rgba(245,158,11,0.15)', color: '#f59e0b'
    },
    {
      icon: 'fa-solid fa-handshake',
      title: 'Uzun Soluklu İlişki',
      desc: 'Müşterilerimizle tek seferlik değil, yıllara dayanan güven temelli iş ortaklığı kuruyoruz.',
      bg: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)'
    },
    {
      icon: 'fa-solid fa-sliders',
      title: 'Kişiselleştirilmiş Çözüm',
      desc: 'Her müşterinin ihtiyacına özel tasarım, malzeme ve baskı seçeneği sunuyoruz; şablon değil özgün çözüm.',
      bg: 'rgba(168,85,247,0.15)', color: 'var(--accent-purple)'
    }
  ];

  services = [
    {
      icon: 'fa-solid fa-id-card',
      title: 'Kartvizit & Matbaa',
      desc: 'Mat laminasyon, UV spot, folyo baskı ve kabartma dahil 5 farklı kartvizit serisi ile profesyonel sunum.',
      tags: ['Standart', 'VIP', 'Folyo', 'Kabartma'],
      bg: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))'
    },
    {
      icon: 'fa-solid fa-file-lines',
      title: 'Broşür & Katalog',
      desc: 'A5 broşürden çok sayfalı ürün kataloguna, kırımlı broşürden cepli dosyaya geniş baskı çözümleri.',
      tags: ['A5 Broşür', 'A4 Kırımlı', 'Katalog', 'Dosya'],
      bg: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))'
    },
    {
      icon: 'fa-solid fa-sign-hanging',
      title: 'Tabela & Totem',
      desc: 'LED aydınlatmalı tabela, kutu harf, cephe kaplaması ve serbest duran totem çözümleriyle marka görünürlüğünüzü artırın.',
      tags: ['LED', 'Kutu Harf', 'Cephe', 'Totem'],
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.1))'
    },
    {
      icon: 'fa-solid fa-gift',
      title: 'Promosyon Ürünleri',
      desc: 'Kalem, defter, çanta, antetli kağıt ve onlarca promosyon kalemi arasından markanıza özel seçimler.',
      tags: ['Kalem', 'Defter', 'Antetli', 'Kurum'],
      bg: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))'
    },
    {
      icon: 'fa-solid fa-truck-fast',
      title: 'Motorlu Kurye',
      desc: 'İstanbul içi aynı gün teslimat garantisiyle hızlı motorlu kurye ve toplu dağıtım hizmetleri.',
      tags: ['Aynı Gün', 'İstanbul', 'Toplu', 'Güvenli'],
      bg: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.1))'
    },
    {
      icon: 'fa-solid fa-print',
      title: 'Dijital Baskı',
      desc: 'Geniş format dijital baskıyla branda, poster, roll-up ve yönlendirme levhası üretimi.',
      tags: ['Branda', 'Poster', 'Roll-up', 'Levha'],
      bg: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.1))'
    }
  ];

  whyUs = [
    {
      title: '14+ Yıllık Sektör Deneyimi',
      desc: 'Antalya\'da kurulup İstanbul\'da büyüyen köklü bir geçmişe sahibiz. Sektörün her döngüsünü ve ihtiyacını bizzat yaşadık.'
    },
    {
      title: 'Tasarımdan Teslimata Tek Elden',
      desc: 'Tasarım desteği, baskı üretimi ve motorlu kurye teslimatını tek çatı altında sunarak zamanınızı ve bütçenizi koruyoruz.'
    },
    {
      title: 'Her Bütçeye Uygun Çözüm',
      desc: 'Küçük işletmeden büyük kuruma, bireysel siparişten toplu üretim çalışmasına kadar esnek fiyatlandırma modelleri.'
    },
    {
      title: 'Müşteri Memnuniyeti Önce',
      desc: 'Onlarca yıl boyunca en iyi referansımız, müşterilerimizin tekrar gelişi oldu. Her siparişte bu sorumluluğu yeniden üstleniyoruz.'
    },
    {
      title: 'Hızlı Geri Dönüş',
      desc: 'Teklif ve sipariş onayında 24 saat içi dönüş politikamızla projenizin zaman kaybetmeden ilerlemesini sağlıyoruz.'
    },
    {
      title: 'Şeffaf Fiyatlandırma',
      desc: 'Gizli maliyet yok, sürpriz ek ücret yok. Baştan belirlenen fiyatla sözleşme imzalıyor ve bu fiyata sadık kalıyoruz.'
    }
  ];
}
