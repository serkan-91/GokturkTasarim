import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customer-page">
      <!-- Customer Hero Header -->
      <div class="customer-hero glass-card">
        <div>
          <span class="badge badge-success">
            <i class="fa-solid fa-user-check"></i> MÜŞTERİ PORTALI
          </span>
          <h2>Hoş Geldiniz, <span class="gradient-text">{{ authService.currentUser()?.fullName }}</span></h2>
          <p class="text-muted">Göktürk Reklam ve Promosyon siparişlerinizi ve tasarım taleplerinizi buradan takip edebilirsiniz.</p>
        </div>

        <button class="btn btn-primary">
          <i class="fa-solid fa-plus"></i> Yeni Tasarım & Kurye Talebi
        </button>
      </div>

      <!-- Active Orders & Requests -->
      <div class="customer-grid">
        <div class="glass-card section-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-box-archive"></i> Aktif Siparişleriniz</h3>
          </div>

          <div class="orders-list">
            <div *ngFor="let order of activeOrders" class="order-item">
              <div class="order-icon">
                <i class="fa-solid fa-bag-shopping"></i>
              </div>
              <div class="order-details">
                <h4>{{ order.title }}</h4>
                <p class="text-muted">Sipariş koda: {{ order.code }} | Tarih: {{ order.date }}</p>
              </div>
              <span class="badge" [ngClass]="order.statusClass">{{ order.status }}</span>
            </div>
          </div>
        </div>

        <!-- Support & Direct Contact -->
        <div class="glass-card section-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-headset"></i> Destek & İletişim</h3>
          </div>
          <div class="support-box">
            <p>Siparişleriniz veya özel tasarım talepleriniz için müşteri temsilcinizle iletişime geçebilirsiniz.</p>
            <button class="btn btn-secondary btn-block">
              <i class="fa-solid fa-envelope"></i> Temsilciye Mesaj Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .customer-hero {
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .customer-hero h2 {
      font-size: 1.8rem;
      margin: 8px 0;
    }

    .customer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 992px) {
      .customer-grid {
        grid-template-columns: 1fr;
      }
    }

    .section-card {
      padding: 24px;
    }

    .card-title-bar {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--glass-border);
    }

    .card-title-bar h3 {
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }

    .order-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(6, 182, 212, 0.15);
      color: var(--secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .order-details {
      flex: 1;
    }

    .order-details h4 {
      font-size: 0.95rem;
      margin-bottom: 2px;
    }

    .order-details p {
      font-size: 0.8rem;
    }

    .support-box {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .support-box p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .btn-block {
      width: 100%;
    }
  `]
})
export class CustomerDashboardComponent {
  public authService = inject(AuthService);

  activeOrders = [
    { title: 'Kurumsal Katalog Baskısı (500 Adet)', code: 'SIP-4091', date: '06.08.2026', status: 'Baskıda', statusClass: 'badge-primary' },
    { title: 'Motorlu Acil Kurye Teslimatı', code: 'SIP-4092', date: '08.08.2026', status: 'Yolda', statusClass: 'badge-warning' }
  ];
}
