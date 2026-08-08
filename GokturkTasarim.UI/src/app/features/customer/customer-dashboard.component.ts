import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { CustomerOrderDto } from '../../core/models/api-response.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

        <a routerLink="/projects" class="btn btn-primary">
          <i class="fa-solid fa-plus"></i> Yeni Sipariş Ver
        </a>
      </div>

      <!-- Active Orders & Requests -->
      <div class="customer-grid">
        <div class="glass-card section-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-box-archive"></i> Aktif Siparişleriniz</h3>
            <button class="refresh-btn" (click)="loadOrders()" title="Yenile">
              <i class="fa-solid fa-arrows-rotate" [class.fa-spin]="loading"></i>
            </button>
          </div>

          <!-- Loading skeleton -->
          <div *ngIf="loading" class="orders-list">
            <div class="order-item skeleton" *ngFor="let s of [1,2]">
              <div class="skel-icon"></div>
              <div class="skel-body">
                <div class="skel-line title"></div>
                <div class="skel-line sub"></div>
              </div>
            </div>
          </div>

          <!-- Orders list -->
          <div class="orders-list" *ngIf="!loading && activeOrders().length > 0">
            <div *ngFor="let order of activeOrders()" class="order-item">
              <div class="order-icon">
                <i class="fa-solid fa-bag-shopping"></i>
              </div>
              <div class="order-details">
                <h4>{{ order.title }}</h4>
                <p class="text-muted">Sipariş Kodu: {{ order.code }} | Tarih: {{ order.date }}</p>
              </div>
              <span class="badge" [ngClass]="order.statusClass">{{ order.status }}</span>
            </div>
          </div>

          <!-- Empty state -->
          <div class="empty-orders" *ngIf="!loading && activeOrders().length === 0">
            <i class="fa-solid fa-inbox"></i>
            <p>Henüz aktif siparişiniz bulunmuyor.</p>
            <a routerLink="/projects" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-cart-plus"></i> İlk Siparişinizi Verin
            </a>
          </div>
        </div>

        <!-- Support & Direct Contact -->
        <div class="glass-card section-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-headset"></i> Destek & İletişim</h3>
          </div>
          <div class="support-box">
            <p>Siparişleriniz veya özel tasarım talepleriniz için müşteri temsilcinizle iletişime geçebilirsiniz.</p>
            <a href="https://wa.me/905325182234?text=Merhaba,%20sipari%C5%9Fim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
               target="_blank"
               class="btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp'tan Yazın
            </a>
            <a routerLink="/contact" class="btn btn-secondary btn-block">
              <i class="fa-solid fa-envelope"></i> Temsilciye Mesaj Gönder
            </a>
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
      flex-wrap: wrap;
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
      .customer-hero {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .section-card {
      padding: 24px;
    }

    .card-title-bar {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card-title-bar h3 {
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .refresh-btn {
      background: none;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.8rem;
      padding: 4px 9px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover { color: var(--secondary); border-color: var(--secondary); }

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
      transition: border-color 0.2s;
    }

    .order-item:hover {
      border-color: var(--glass-border-hover);
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
      flex-shrink: 0;
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

    /* Skeleton */
    .order-item.skeleton { pointer-events: none; }
    .skel-icon {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      background: rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .skel-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .skel-line {
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skel-line.title { width: 75%; height: 14px; }
    .skel-line.sub { width: 55%; height: 11px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Empty state */
    .empty-orders {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px;
      text-align: center;
    }
    .empty-orders i { font-size: 2.5rem; color: var(--text-dim); }
    .empty-orders p { font-size: 0.88rem; color: var(--text-muted); margin: 0; }

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
      justify-content: center;
    }

    .btn-sm { padding: 8px 16px; font-size: 0.85rem; }

    .btn-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 14px rgba(37,211,102,0.25);
    }

    .btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37,211,102,0.35);
      color: #fff;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  activeOrders = signal<CustomerOrderDto[]>([]);
  loading = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.apiService.getCustomerOrders().subscribe({
      next: (orders) => {
        this.activeOrders.set(orders);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
