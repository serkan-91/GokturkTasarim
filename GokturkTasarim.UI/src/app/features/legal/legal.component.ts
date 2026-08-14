import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

type LegalTab = 'mss' | 'obf' | 'delivery' | 'cancellation' | 'kvkk' | 'terms';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legal-page">

      <!-- ── HERO BANNER ── -->
      <div class="legal-hero glass-card">
        <div class="hero-inner">
          <div class="hero-tag">
            <i class="fa-solid fa-scale-balanced text-cyan"></i> Yasal Bilgilendirme &amp; Sözleşmeler
          </div>
          <h1>Yasal Haklarınız &amp; <span class="gradient-text">Şeffaf Hizmet Politikamız</span></h1>
          <p>6502 sayılı TKHK, 6563 sayılı ETK ve 6698 sayılı KVKK mevzuatlarına uygun resmi sözleşmelerimiz ve aydınlatma metinlerimiz.</p>
        </div>
      </div>

      <!-- ── TAB MENU ── -->
      <div class="legal-tabs-wrap">
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'mss'"
          (click)="activeTab.set('mss')"
        >
          <i class="fa-solid fa-file-contract"></i> Mesafeli Satış Sözleşmesi
        </button>
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'delivery'"
          (click)="activeTab.set('delivery')"
        >
          <i class="fa-solid fa-truck-fast"></i> Teslimat ve Kargo Koşulları
        </button>
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'cancellation'"
          (click)="activeTab.set('cancellation')"
        >
          <i class="fa-solid fa-arrow-rotate-left"></i> İptal ve İade Koşulları
        </button>
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'obf'"
          (click)="activeTab.set('obf')"
        >
          <i class="fa-solid fa-circle-info"></i> Ön Bilgilendirme Formu
        </button>
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'kvkk'"
          (click)="activeTab.set('kvkk')"
        >
          <i class="fa-solid fa-user-shield"></i> KVKK Aydınlatma Metni
        </button>
        <button
          class="legal-tab-btn"
          [class.active]="activeTab() === 'terms'"
          (click)="activeTab.set('terms')"
        >
          <i class="fa-solid fa-shield-halved"></i> Gizlilik &amp; Çerez Politikası
        </button>
      </div>

      <!-- ── İÇERİK KARTLARI ── -->
      <div class="glass-card legal-card">

        <!-- 1. MESAFELİ SATIŞ SÖZLEŞMESİ -->
        <div *ngIf="activeTab() === 'mss'" class="doc-body animate-fadeIn">
          <h2>MESAFELİ SATIŞ SÖZLEŞMESİ</h2>
          <span class="doc-meta">Son Güncelleme: 09.08.2026 · 6502 Sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği Uyarınca</span>

          <hr class="doc-hr" />

          <h3>MADDE 1 — TARAFLAR</h3>
          <p><strong>SATICI BİLGİLERİ:</strong></p>
          <ul class="legal-list">
            <li><strong>Unvanı:</strong> Göktürk Reklam &amp; Tasarım Sanayi ve Ticaret Ltd. Şti.</li>
            <li><strong>Vergi Dairesi &amp; No:</strong> Maslak V.D. — 1920839412</li>
            <li><strong>Adres:</strong> Göktürk Merkez Mah. Göktürk Cad. No:79 Eyüpsultan / İstanbul</li>
            <li><strong>Telefon:</strong> 0 (532) 518 22 34 / 0 (532) 666 86 10</li>
            <li><strong>E-Posta:</strong> info&#64;gokturktasarim.com</li>
          </ul>

          <p><strong>ALICI (MÜŞTERİ) BİLGİLERİ:</strong></p>
          <p>Sipariş oluşturma esnasında Müşteri tarafından gokturktasarim.com portalında beyan edilen ad, unvan, vergi no/T.C. no ve teslimat adresi esas alınır.</p>

          <h3>MADDE 2 — SÖZLEŞMENİN KONUSU</h3>
          <p>İşbu Sözleşme, ALICI'nın SATICI'ya ait gokturktasarim.com web sitesinden elektronik ortamda siparişini verdiği matbaa, promosyon, tabela, dijital baskı veya kurye hizmetlerinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini kapsar.</p>

          <h3>MADDE 3 — ÜRÜN &amp; HİZMET BİLGİLERİ VE TESLİMAT</h3>
          <p>Satın alınan ürün/hizmetin türü, miktarı, birim fiyatı, KDV dahil toplam tutarı ve teslimat adresi sipariş özetinde ve e-faturada belirtildiği gibidir. Ürünler anlaşmalı kargo veya motorlu kurye ile ALICI'nın bildirdiği adrese teslim edilir.</p>

          <div class="legal-alert-box warning-box">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>MADDE 4 — CAYMA HAKKI VE ÖZEL İSTİSNALAR (KİŞİYE ÖZEL BARKOD/BASKI)</strong>
              <p>Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (b) bendi gereğince: <strong>"Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmelerde cayma hakkı kullanılamaz."</strong> Bu kapsamda ALICI'nın özel grafik tasarımı, şirket logosu, isim baskısı veya özel ölçülerde üretilen kartvizit, broşür, tabela ve promosyon ürünlerinde baskı/üretim başladıktan sonra cayma hakkı kullanılamaz. Üretim öncesinde gönderilen iptal talepleri Yönetici (Admin) onayına tabidir.</p>
            </div>
          </div>

          <h3>MADDE 5 — UYUŞMAZLIKLARIN ÇÖZÜMÜ</h3>
          <p>İşbu Sözleşme'nin uygulanmasında, Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile SATICI'nın yerleşim yerindeki (İstanbul) Tüketici Mahkemeleri yetkilidir.</p>
        </div>

        <!-- 2. TESLİMAT VE KARGO KOŞULLARI -->
        <div *ngIf="activeTab() === 'delivery'" class="doc-body animate-fadeIn">
          <h2>TESLİMAT VE KARGO KOŞULLARI</h2>
          <span class="doc-meta">Sipariş Hazırlık, Üretim Süreleri ve Güvenli Teslimat Standartları</span>

          <hr class="doc-hr" />

          <h3>1. TESLİMAT SÜRESİ VE ÜRETİM AŞAMASI</h3>
          <p>Siparişleriniz onaylandıktan ve ödeme işlemi tamamlandıktan sonra tasarım kontrolü yapılarak üretime alınır:</p>
          <ul class="legal-list">
            <li><strong>Standart & VIP Kartvizitler:</strong> 1 - 3 İş Günü içerisinde basılarak kargoya verilir.</li>
            <li><strong>Broşür, Katalog & Matbaa:</strong> 2 - 4 İş Günü içerisinde hazırlanır.</li>
            <li><strong>Promosyon & Baskılı Ürünler:</strong> Adet ve baskı tekniğine göre 2 - 5 İş Günü içinde kargolanır.</li>
            <li><strong>İstanbul İçi VIP Motorlu Kurye:</strong> Üretimi tamamlanan acil siparişler aynı gün 2-4 saat içinde adrese elden teslim edilir.</li>
          </ul>

          <h3>2. KARGO FİRMALARI VE TAKİP</h3>
          <p>Tüm Türkiye geneline gönderilerimiz anlaşmalı ulusal kargo firmaları (Yurtiçi Kargo, Aras Kargo, MNG Kargo, Sürat Kargo vb.) aracılığıyla sigortalı olarak yapılmaktadır. Siparişiniz kargoya verildiğinde SMS ve E-Posta ile <strong>Kargo Takip Numarası</strong> tarafınıza iletilir; ayrıca Müşteri Portalımız üzerinden canlı olarak takip edebilirsiniz.</p>

          <h3>3. HASARLI VE EKSİK PAKET TESLİMATI</h3>
          <p>Kargo teslimatı sırasında paketin dış yüzeyinde ezilme, yırtılma veya ıslanma gibi hasar tespit edilirse, paketi teslim almadan kargo görevlisine <strong>"Hasar Tespit Tutanağı"</strong> tutturulmalı ve derhal tarafımıza bilgi verilmelidir.</p>
        </div>

        <!-- 3. İPTAL VE İADE KOŞULLARI -->
        <div *ngIf="activeTab() === 'cancellation'" class="doc-body animate-fadeIn">
          <h2>İPTAL VE İADE KOŞULLARI</h2>
          <span class="doc-meta">Tüketici Hakları, Sipariş İptali ve İade Süreçleri Bilgilendirmesi</span>

          <hr class="doc-hr" />

          <h3>1. SİPARİŞ İPTAL TALEBİ</h3>
          <p>Verdiğiniz siparişi henüz <strong>üretim/baskı aşamasına geçmeden önce</strong> Müşteri Paneli üzerinden veya destek hattımızla iletişime geçerek iptal edebilirsiniz. İptal talebiniz onaylandığında ödemeniz kullandığınız ödeme yöntemine göre (Kredi Kartı veya Banka Hesabı) 1-3 iş günü içinde kesintisiz olarak iade edilir.</p>

          <div class="legal-alert-box warning-box">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>KİŞİYE ÖZEL ÜRETİLEN ÜRÜNLERDE İADE İSTİSNASI</strong>
              <p>6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği Madde 15/b uyarınca: <em>"Müşterinin özel istekleri, kurumsal logosu, isim veya özel ölçüleri doğrultusunda basılan ve kişiselleştirilen ürünlerde"</em> baskı işlemi başladıktan sonra cayma ve keyfi iade hakkı bulunmamaktadır.</p>
            </div>
          </div>

          <h3>2. AYIPLI / HATALI BASKI DURUMUNDA YENİDEN BASKI VE İADE</h3>
          <p>Firmamızdan kaynaklanan baskı kayması, hatalı renk, eksik adet veya üretim kusuru tespit edilmesi durumunda, hatalı ürünler bedelsiz olarak <strong>derhal yeniden basılarak</strong> ekspres kargo ile adresinize gönderilir veya talep halinde tutarın tamamı iade edilir.</p>

          <h3>3. İADE ÖDEMELERİ</h3>
          <p>İadesi onaylanan siparişlerin bedeli, ödeme PayTR Sanal POS üzerinden kredi kartıyla yapılmışsa doğrudan karta iade edilir. Havale/EFT ile yapılan ödemeler bildirilen IBAN numarasına gönderilir.</p>
        </div>

        <!-- 4. ÖN BİLGİLENDİRME FORMU -->
        <div *ngIf="activeTab() === 'obf'" class="doc-body animate-fadeIn">
          <h2>ÖN BİLGİLENDİRME FORMU</h2>
          <span class="doc-meta">6502 Sayılı Tüketicinin Korunması Hakkında Kanun Madde 48 Uyarınca Hazırlanmıştır</span>

          <hr class="doc-hr" />

          <h3>1. SATICI BİLGİLERİ</h3>
          <p><strong>Unvan:</strong> Göktürk Reklam &amp; Tasarım San. Tic. Ltd. Şti.<br>
          <strong>Adres:</strong> Göktürk Merkez Mah. Göktürk Cad. No:79 Eyüpsultan / İstanbul<br>
          <strong>Telefon:</strong> 0 (532) 518 22 34 — <strong>E-Posta:</strong> info&#64;gokturktasarim.com</p>

          <h3>2. SÖZLEŞME KONUSU ÜRÜN/HİZMET ÖZELLİKLERİ</h3>
          <p>Sipariş edilen ürünlerin temel özellikleri (türü, miktarı, baskı çeşidi, ebatları, KDV dahil satış bedeli ve kargo/teslimat ücreti) ödeme adımı öncesinde Müşteri onayına sunulur.</p>

          <h3>3. ŞİKAYET VE İLETİŞİM</h3>
          <p>Müşterilerimiz her türlü talep ve şikayetlerini <strong>info&#64;gokturktasarim.com</strong> adresine veya <strong>0 532 518 22 34</strong> numaralı WhatsApp destek hattımıza iletebilirler.</p>
        </div>

        <!-- 3. KVKK AYDINLATMA METNİ -->
        <div *ngIf="activeTab() === 'kvkk'" class="doc-body animate-fadeIn">
          <h2>KVKK AYDINLATMA METNİ</h2>
          <span class="doc-meta">6698 Sayılı Kişisel Verilerin Korunması Kanunına ("KVKK") Uygun Şeffaf Veri Politikası</span>

          <hr class="doc-hr" />

          <p>Göktürk Reklam &amp; Tasarım San. Tic. Ltd. Şti. ("Şirket") olarak kişisel verilerinizin güvenliğine azami önem veriyoruz. 6698 sayılı KVKK uyarınca Veri Sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar doğrultusunda işlemekteyiz.</p>

          <h3>1. İŞLENEN KİŞİSEL VERİLERİNİZ</h3>
          <ul class="legal-list">
            <li><strong>Kimlik Bilgileri:</strong> Ad, Soyad, T.C. Kimlik No / Vergi No.</li>
            <li><strong>İletişim Bilgileri:</strong> Telefon Numarası, E-Posta Adresi, Fatura ve Teslimat Adresi.</li>
            <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş Geçmişi, E-Fatura Detayları, Kargo Takip Bilgileri.</li>
          </ul>

          <h3>2. VERİLERİN İŞLENME AMACI</h3>
          <p>Toplanan kişisel verileriniz; siparişlerin hazırlanması, e-fatura düzenlenmesi, kargo ve teslimat süreçlerinin yürütülmesi, müşteri destek taleplerinin karşılanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>

          <h3>3. KVKK MADDE 11 KAPSAMINDAKİ HAKLARINIZ</h3>
          <p>KVKK'nın 11. maddesi uyarınca veri sahibi olarak; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme hakkına sahipsiniz. Başvurularınızı <strong>info&#64;gokturktasarim.com</strong> adresine iletebilirsiniz.</p>
        </div>

        <!-- 4. GİZLİLİK & ÇEREZ POLITIKASI -->
        <div *ngIf="activeTab() === 'terms'" class="doc-body animate-fadeIn">
          <h2>GİZLİLİK VE ÇEREZ (COOKIE) POLITIKASI</h2>
          <span class="doc-meta">Web Sitesi Kullanım ve Güvenlik Standartları</span>

          <hr class="doc-hr" />

          <p>Göktürk Tasarım portalında ziyaretçilerimizin ve müşterilerimizin gizliliğini korumak temel ilkemizdir. Web sitemizde oturum yönetimi ve kullanıcı tercihlerinin hatırlanması amacıyla güvenli çerezler (cookies) kullanılmaktadır.</p>

          <h3>1. ÇEREZ KULLANIMI</h3>
          <p>Çerezler, tarayıcınız tarafından bilgisayarınıza yerleştirilen küçük metin dosyalarıdır. Sitemizde sadece kullanıcı oturumunun korunması ve sepet tercihlerinin saklanması amacıyla zorunlu teknik çerezler kullanılmaktadır. Üçüncü şahıslara reklam amaçlı veri aktarımı yapılmaz.</p>

          <h3>2. GÜVENLİK (SSL &amp; ENKRİPSİYON)</h3>
          <p>Web sitemiz 256-bit SSL (TLS) şifreleme sertifikasına sahiptir. Kredi kartı ve ödeme bilgileriniz sistemlerimizde saklanmaz, doğrudan PayTR / iyzico güvenli ortak ödeme altyapısına iletilir.</p>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .legal-page { display: flex; flex-direction: column; gap: 24px; }

    .legal-hero {
      padding: 36px 40px; background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%);
      border-left: 4px solid var(--primary);
    }
    .hero-tag { font-size: 0.78rem; font-weight: 800; color: var(--primary); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
    .legal-hero h1 { font-size: 1.6rem; font-weight: 900; margin: 0 0 8px; }
    .legal-hero p { font-size: 0.86rem; color: var(--text-muted); margin: 0; max-width: 780px; }

    /* Tabs */
    .legal-tabs-wrap { display: flex; gap: 10px; flex-wrap: wrap; }
    .legal-tab-btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px;
      border-radius: var(--radius-md); background: var(--bg-card); border: 1.5px solid var(--glass-border);
      color: var(--text-muted); font-size: 0.86rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .legal-tab-btn:hover { background: rgba(99,102,241,0.1); color: var(--primary); border-color: rgba(99,102,241,0.3); }
    .legal-tab-btn.active {
      background: linear-gradient(135deg, var(--primary), var(--accent-purple)); color: #fff;
      border-color: transparent; box-shadow: 0 6px 20px rgba(99,102,241,0.35);
    }

    /* Content Card */
    .legal-card { padding: 36px 44px; color: var(--text-main); }
    .doc-body h2 { font-size: 1.35rem; font-weight: 900; color: var(--text-main); margin: 0 0 4px; letter-spacing: -0.01em; }
    .doc-meta { font-size: 0.76rem; color: var(--text-dim); display: block; margin-bottom: 16px; }
    .doc-hr { border: none; height: 1px; background: var(--glass-border); margin: 16px 0 24px; }
    .doc-body h3 { font-size: 1rem; font-weight: 800; color: var(--secondary); margin: 24px 0 10px; }
    .doc-body p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.75; margin: 0 0 12px; }
    .legal-list { margin: 0 0 16px 20px; color: var(--text-muted); font-size: 0.86rem; line-height: 1.7; }
    .legal-list li { margin-bottom: 6px; }

    .legal-alert-box {
      display: flex; align-items: flex-start; gap: 14px; padding: 18px 22px; border-radius: var(--radius-md); margin: 20px 0;
    }
    .warning-box { background: rgba(245,158,11,0.12); border: 1.5px solid rgba(245,158,11,0.35); color: #f59e0b; }
    .warning-box i { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
    .warning-box strong { display: block; font-size: 0.92rem; margin-bottom: 4px; }
    .warning-box p { color: var(--text-main); margin: 0; font-size: 0.84rem; line-height: 1.6; }
  `]
})
export class LegalComponent implements OnInit {
  activeTab = signal<LegalTab>('mss');

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['mss', 'delivery', 'cancellation', 'obf', 'kvkk', 'terms'].includes(params['tab'])) {
        this.activeTab.set(params['tab'] as LegalTab);
      }
    });
  }
}
