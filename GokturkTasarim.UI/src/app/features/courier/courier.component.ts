import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface TrackingResultDto {
  trackingCode: string;
  serviceType: 'MotorCourier' | 'Cargo';
  carrierName: string;
  sender: string;
  receiver: string;
  deliveryAddress: string;
  status: 'Received' | 'Preparing' | 'InTransit' | 'Delivered';
  statusText: string;
  estimatedDelivery: string;
  courierName?: string;
  courierPhone?: string;
  courierPlate?: string;
  timeline: {
    title: string;
    description: string;
    date: string;
    completed: boolean;
    active: boolean;
  }[];
}

@Component({
  selector: 'app-courier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="courier-page">

      <!-- ── HERO / HEADER BANNER ─────────────────────────── -->
      <div class="courier-hero glass-card">
        <div class="hero-text-side">
          <span class="badge badge-primary">
            <i class="fa-solid fa-truck-fast"></i> GÖKTÜRK EXPRESS KURYE & KARGO
          </span>
          <h2>Canlı Kargo & Kurye Takip Portalı</h2>
          <p class="text-muted">
            Siparişinizin anlık kurye konumunu sorgulayın veya İstanbul içi aynı gün motorlu acil kurye talebi oluşturun.
          </p>
        </div>

        <div class="hero-stats-pills">
          <div class="mini-stat">
            <i class="fa-solid fa-bolt"></i>
            <div>
              <strong>45 Dakika</strong>
              <span>Ort. Motorlu Kurye</span>
            </div>
          </div>
          <div class="mini-stat">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>%100 Sigortalı</strong>
              <span>Güvenli Taşımacılık</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── SORGULAMA KARTI (TRACKING SEARCH) ─────────────────────────── -->
      <div class="glass-card tracking-search-card">
        <div class="search-title-bar">
          <h3><i class="fa-solid fa-magnifying-glass-location"></i> Gönderi Sorgulama</h3>
          <span class="text-muted">Takip kodunuzu girerek anlık durumu öğrenin</span>
        </div>

        <form (ngSubmit)="onSearchTracking()" class="tracking-form">
          <div class="search-input-wrap">
            <i class="fa-solid fa-barcode barcode-icon"></i>
            <input
              type="text"
              class="tracking-input"
              placeholder="Örn: GKT-84920 veya Kargo Takip Kodu..."
              [(ngModel)]="searchCode"
              name="searchCode"
            />
            <button type="submit" class="btn btn-primary search-btn" [disabled]="loadingSearch">
              <i class="fa-solid" [ngClass]="loadingSearch ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'"></i>
              {{ loadingSearch ? 'Sorgulanıyor...' : 'Sorgula' }}
            </button>
          </div>

          <!-- Örnek kod hızlı test butonları -->
          <div class="demo-codes">
            <span class="demo-label">Örnek Sorgu Dene:</span>
            <button type="button" class="chip-btn" (click)="setDemoCode('GKT-84920')">
              <i class="fa-solid fa-motorcycle"></i> GKT-84920 (Motor Kurye)
            </button>
            <button type="button" class="chip-btn" (click)="setDemoCode('YKN-99412')">
              <i class="fa-solid fa-box"></i> YKN-99412 (Yurtiçi Kargo)
            </button>
          </div>
        </form>
      </div>

      <!-- ── SORGULAMA SONUCU & TIMELINE (VARSA) ─────────────────────────── -->
      <div *ngIf="trackingResult()" class="glass-card tracking-result-card animate-fadeIn">
        <div class="result-header">
          <div class="result-title-group">
            <span class="tracking-code-badge">{{ trackingResult()?.trackingCode }}</span>
            <h4>
              {{ trackingResult()?.serviceType === 'MotorCourier' ? 'Motorlu Acil Kurye Teslimatı' : 'Anlaşmalı Kargo Gönderisi' }}
            </h4>
            <span class="badge" [ngClass]="getStatusBadgeClass(trackingResult()?.status)">
              {{ trackingResult()?.statusText }}
            </span>
          </div>

          <div class="estimated-time-box">
            <span class="est-lbl">Tahmini Teslimat</span>
            <span class="est-val"><i class="fa-solid fa-clock"></i> {{ trackingResult()?.estimatedDelivery }}</span>
          </div>
        </div>

        <div class="result-body-grid">
          <!-- Sol: Timeline Adımları -->
          <div class="timeline-container">
            <h5 class="sub-title"><i class="fa-solid fa-route"></i> Gönderi Geçmişi & Adımlar</h5>

            <div class="timeline">
              <div
                *ngFor="let step of trackingResult()?.timeline"
                class="timeline-item"
                [class.completed]="step.completed"
                [class.active]="step.active"
              >
                <div class="timeline-icon">
                  <i class="fa-solid" [ngClass]="step.completed ? 'fa-check' : step.active ? 'fa-truck-fast' : 'fa-circle'"></i>
                </div>
                <div class="timeline-content">
                  <div class="step-head">
                    <strong class="step-title">{{ step.title }}</strong>
                    <span class="step-date">{{ step.date }}</span>
                  </div>
                  <p class="step-desc">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sağ: Detay Bilgileri & Kurye / Firma Kartı -->
          <div class="details-side">
            <h5 class="sub-title"><i class="fa-solid fa-circle-info"></i> Teslimat Detayları</h5>

            <div class="info-card">
              <div class="info-row">
                <span class="info-lbl">Taşıyıcı Firma / Hizmet</span>
                <strong class="info-val text-cyan">{{ trackingResult()?.carrierName }}</strong>
              </div>
              <div class="info-row">
                <span class="info-lbl">Gönderici</span>
                <span class="info-val">{{ trackingResult()?.sender }}</span>
              </div>
              <div class="info-row">
                <span class="info-lbl">Alıcı Adresi</span>
                <span class="info-val">{{ trackingResult()?.deliveryAddress }}</span>
              </div>
            </div>

            <!-- Kurye Özel Kartı (Eğer Motorlu Kurye ise) -->
            <div *ngIf="trackingResult()?.courierName" class="courier-driver-card">
              <div class="driver-avatar">
                <i class="fa-solid fa-user-ninja"></i>
              </div>
              <div class="driver-info">
                <span class="driver-lbl">Zamanında Teslimat Kuryesi</span>
                <strong class="driver-name">{{ trackingResult()?.courierName }}</strong>
                <span class="driver-plate"><i class="fa-solid fa-motorcycle"></i> {{ trackingResult()?.courierPlate }}</span>
              </div>
              <a *ngIf="trackingResult()?.courierPhone" [href]="'tel:' + trackingResult()?.courierPhone" class="btn btn-success btn-sm driver-call-btn">
                <i class="fa-solid fa-phone"></i> Kuryeyi Ara
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ACİL KURYE TALEP HESAPLAYICI FORM (Nereden -> Nereye) ─────────────────────────── -->
      <div class="glass-card courier-request-card">
        <div class="card-title-bar">
          <div>
            <h3><i class="fa-solid fa-motorcycle"></i> Acil Motorlu Kurye Çağır</h3>
            <p class="text-muted">İstanbul içi evrak, matbu baskı veya paketinizi adresten alıp aynı gün adrese teslim edelim.</p>
          </div>
          <span class="badge badge-warning"><i class="fa-solid fa-stopwatch"></i> Anında Adreste</span>
        </div>

        <form (ngSubmit)="onRequestCourier()" class="request-form-grid">
          <div class="form-group">
            <label><i class="fa-solid fa-location-dot text-emerald"></i> Alınacak Adres (Çıkış)</label>
            <select class="form-input" [(ngModel)]="requestForm.pickupDistrict" name="pickupDistrict">
              <option value="">İlçe Seçiniz...</option>
              <option value="Eyüpsultan (Göktürk)">Eyüpsultan (Göktürk)</option>
              <option value="Şişli / Levent">Şişli / Levent / Maslak</option>
              <option value="Beşiktaş / Kadıköy">Beşiktaş / Kadıköy</option>
              <option value="Başakşehir / İkitelli">Başakşehir / İkitelli</option>
              <option value="Diğer İstanbul">Diğer İstanbul İlçeleri</option>
            </select>
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-flag-checkered text-cyan"></i> Teslim Edilecek Adres (Varış)</label>
            <select class="form-input" [(ngModel)]="requestForm.dropoffDistrict" name="dropoffDistrict">
              <option value="">İlçe Seçiniz...</option>
              <option value="Eyüpsultan (Göktürk)">Eyüpsultan (Göktürk)</option>
              <option value="Şişli / Levent">Şişli / Levent / Maslak</option>
              <option value="Beşiktaş / Kadıköy">Beşiktaş / Kadıköy</option>
              <option value="Başakşehir / İkitelli">Başakşehir / İkitelli</option>
              <option value="Diğer İstanbul">Diğer İstanbul İlçeleri</option>
            </select>
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-box-open"></i> Paket / İçerik Tipi</label>
            <select class="form-input" [(ngModel)]="requestForm.packageType" name="packageType">
              <option value="Evrak / Belge">Evrak / Sözleşme / Belge</option>
              <option value="Matbaa & Baskı">Matbu Baskı / Kartvizit / Broşür</option>
              <option value="Kutu / Paket">Küçük Kutu / Promosyon Paketi</option>
              <option value="Hassas / Özel">Hassas Gönderi (Özel Kurye)</option>
            </select>
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-phone"></i> İletişim Telefonu</label>
            <input type="tel" class="form-input" placeholder="05XX XXX XX XX" [(ngModel)]="requestForm.phone" name="phone" />
          </div>

          <div class="form-group full-width">
            <label><i class="fa-solid fa-align-left"></i> Açıklama & Notlar (İsteğe Bağlı)</label>
            <textarea class="form-input" rows="2" placeholder="Zil adı, kat no veya özel teslimat talimatı..." [(ngModel)]="requestForm.notes" name="notes"></textarea>
          </div>

          <div class="form-actions-bar full-width">
            <div class="estimated-price-tag">
              <span class="price-lbl">Tahmini Kurye Ücreti:</span>
              <span class="price-val">₺350,00'den başlayan fiyatlarla</span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" [disabled]="submittingRequest">
              <i class="fa-solid" [ngClass]="submittingRequest ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              {{ submittingRequest ? 'Kurye Çağrılıyor...' : 'Acil Kurye Çağır' }}
            </button>
          </div>
        </form>

        <div *ngIf="requestSuccess()" class="alert-success-box animate-fadeIn">
          <i class="fa-solid fa-circle-check"></i>
          <div>
            <strong>Kurye Talebiniz Alındı!</strong>
            <p>Müşteri temsilcimiz ve en yakın kuryemiz belirttiğiniz telefon numarasından 5 dakika içinde size ulaşacaktır.</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .courier-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── HERO BANNER ── */
    .courier-hero {
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      background: linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(99,102,241,0.1) 100%);
      flex-wrap: wrap;
    }

    .hero-text-side h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 10px 0 6px 0;
      font-family: var(--font-heading);
    }

    .hero-stats-pills {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .mini-stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }
    .mini-stat i {
      font-size: 1.5rem;
      color: var(--secondary);
    }
    .mini-stat strong { display: block; font-size: 0.95rem; }
    .mini-stat span { font-size: 0.76rem; color: var(--text-muted); }

    /* ── TRACKING SEARCH CARD ── */
    .tracking-search-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-title-bar h3 {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--secondary);
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .barcode-icon {
      position: absolute;
      left: 16px;
      font-size: 1.2rem;
      color: var(--text-dim);
    }

    .tracking-input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      background: var(--bg-card);
      border: 1.5px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 1rem;
      font-family: var(--font-heading);
      outline: none;
      transition: border-color var(--transition-fast);
    }

    .tracking-input:focus {
      border-color: var(--primary);
    }

    .search-btn {
      padding: 14px 28px;
      font-weight: 700;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .demo-codes {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .demo-label {
      font-size: 0.78rem;
      color: var(--text-dim);
    }

    .chip-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      color: var(--text-muted);
      font-size: 0.78rem;
      padding: 5px 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);
    }

    .chip-btn:hover {
      background: rgba(99,102,241,0.15);
      color: var(--primary);
      border-color: var(--primary);
    }

    /* ── RESULT CARD & TIMELINE ── */
    .tracking-result-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      border: 1.5px solid rgba(6,182,212,0.3) !important;
    }

    .result-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--glass-border);
      flex-wrap: wrap;
      gap: 16px;
    }

    .result-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tracking-code-badge {
      font-family: monospace;
      font-size: 1rem;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      background: rgba(6,182,212,0.15);
      color: var(--secondary);
    }

    .result-title-group h4 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
    }

    .estimated-time-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .est-lbl { font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; }
    .est-val { font-size: 1.05rem; font-weight: 800; color: var(--accent-emerald); }

    .result-body-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 32px;
    }

    @media (max-width: 900px) {
      .result-body-grid { grid-template-columns: 1fr; }
    }

    .sub-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-main);
    }

    /* Timeline */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
      padding-left: 20px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: var(--glass-border);
    }

    .timeline-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .timeline-icon {
      position: absolute;
      left: -20px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      border: 2px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      color: var(--text-dim);
      z-index: 1;
    }

    .timeline-item.completed .timeline-icon {
      background: var(--accent-emerald);
      border-color: var(--accent-emerald);
      color: #fff;
    }

    .timeline-item.active .timeline-icon {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      box-shadow: 0 0 12px var(--primary-glow);
    }

    .timeline-content {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      flex: 1;
    }

    .timeline-item.active .timeline-content {
      border-color: var(--primary);
    }

    .step-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .step-title { font-size: 0.88rem; font-weight: 700; }
    .step-date { font-size: 0.72rem; color: var(--text-dim); }
    .step-desc { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    /* Details side */
    .details-side { display: flex; flex-direction: column; gap: 16px; }

    .info-card {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row { display: flex; flex-direction: column; gap: 2px; }
    .info-lbl { font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; }
    .info-val { font-size: 0.88rem; font-weight: 600; }
    .text-cyan { color: var(--secondary); }

    /* Driver Card */
    .courier-driver-card {
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .driver-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--accent-emerald);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .driver-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .driver-lbl { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; }
    .driver-name { font-size: 0.95rem; font-weight: 800; }
    .driver-plate { font-size: 0.78rem; color: var(--text-muted); }

    /* ── REQUEST COURIER FORM ── */
    .courier-request-card {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);
    }
    .card-title-bar h3 { font-size: 1.25rem; font-weight: 800; margin: 0 0 4px 0; }
    .card-title-bar p { margin: 0; font-size: 0.88rem; }

    .request-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    @media (max-width: 640px) {
      .request-form-grid { grid-template-columns: 1fr; }
    }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }

    .form-group label {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .form-input {
      padding: 12px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.9rem;
      outline: none;
      transition: border-color var(--transition-fast);
    }

    .form-input:focus { border-color: var(--primary); }

    .form-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .estimated-price-tag { display: flex; flex-direction: column; gap: 2px; }
    .price-lbl { font-size: 0.76rem; color: var(--text-dim); }
    .price-val { font-size: 1.1rem; font-weight: 800; color: var(--accent-emerald); }

    .alert-success-box {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: var(--radius-md);
      color: var(--status-success);
    }
    .alert-success-box i { font-size: 1.6rem; }
    .alert-success-box p { margin: 2px 0 0 0; font-size: 0.85rem; color: var(--text-muted); }
  `]
})
export class CourierComponent {
  private apiService = inject(ApiService);

  searchCode = '';
  loadingSearch = false;
  trackingResult = signal<TrackingResultDto | null>(null);

  // Kurye talep formu
  requestForm = {
    pickupDistrict: '',
    dropoffDistrict: '',
    packageType: 'Evrak / Belge',
    phone: '',
    notes: ''
  };

  submittingRequest = false;
  requestSuccess = signal(false);

  setDemoCode(code: string): void {
    this.searchCode = code;
    this.onSearchTracking();
  }

  onSearchTracking(): void {
    if (!this.searchCode) return;
    this.loadingSearch = true;

    // Simüle edilmiş canlı kurye / kargo verisi (Backend API'ye kolayca bağlanabilir)
    setTimeout(() => {
      this.loadingSearch = false;

      if (this.searchCode.toUpperCase().startsWith('GKT')) {
        // Göktürk Motor Kurye Takip Simülasyonu
        this.trackingResult.set({
          trackingCode: this.searchCode.toUpperCase(),
          serviceType: 'MotorCourier',
          carrierName: 'Göktürk VIP Motor Kurye Servisi',
          sender: 'Göktürk Reklam Merkez Depo',
          receiver: 'Ahmet Y. (Maslak Plaza)',
          deliveryAddress: 'Büyükdere Cad. No:192 Maslak / İstanbul',
          status: 'InTransit',
          statusText: 'Kurye Dağıtımda (Yolda)',
          estimatedDelivery: 'Bugün 18:30 (Yaklaşık 25 dk)',
          courierName: 'Mehmet Yılmaz',
          courierPhone: '0532 518 22 34',
          courierPlate: '34 GKT 92',
          timeline: [
            { title: 'Sipariş Oluşturuldu', description: 'Paket üretimden kurye birimine iletildi.', date: '16:45', completed: true, active: false },
            { title: 'Kurye Paketi Aldı', description: 'Kurye Mehmet Y. depodan çıkış yaptı.', date: '17:15', completed: true, active: false },
            { title: 'Dağıtımda (Yolda)', description: 'Kurye hedef adrese doğru ilerliyor.', date: '17:40', completed: false, active: true },
            { title: 'Teslim Edildi', description: 'Alıcıya imza karşılığı teslim edilecek.', date: 'Bekleniyor', completed: false, active: false }
          ]
        });
      } else {
        // Genel Kargo Takip Simülasyonu
        this.trackingResult.set({
          trackingCode: this.searchCode.toUpperCase(),
          serviceType: 'Cargo',
          carrierName: 'Yurtiçi Kargo (Anlaşmalı Gönderi)',
          sender: 'Göktürk Tasarım Matbaa Ltd.',
          receiver: 'Fatma K. (Köyçiçi Mah.)',
          deliveryAddress: 'Atatürk Cad. Eyüpsultan / İstanbul',
          status: 'Preparing',
          statusText: 'Kargo Şubesinde Hazırlanıyor',
          estimatedDelivery: 'Yarın 12:00 Öncesi',
          timeline: [
            { title: 'Kargo Barkodu Basıldı', description: 'Göktürk matbaadan kargo kuryesine teslim edildi.', date: 'Dün 18:00', completed: true, active: false },
            { title: 'Aktarma Merkezinde', description: 'İstanbul Ana Aktarma Şubesinde işleniyor.', date: 'Bugün 09:20', completed: false, active: true },
            { title: 'Dağıtıma Çıkarıldı', description: 'Kargo aracı dağıtıma başlayacak.', date: 'Bekleniyor', completed: false, active: false },
            { title: 'Teslim Edildi', description: 'Alıcıya teslimat.', date: 'Bekleniyor', completed: false, active: false }
          ]
        });
      }
    }, 600);
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'InTransit': return 'badge-primary';
      case 'Preparing': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  onRequestCourier(): void {
    if (!this.requestForm.pickupDistrict || !this.requestForm.dropoffDistrict || !this.requestForm.phone) {
      return;
    }

    this.submittingRequest = true;
    setTimeout(() => {
      this.submittingRequest = false;
      this.requestSuccess.set(true);
      setTimeout(() => { this.requestSuccess.set(false); }, 6000);
    }, 800);
  }
}
