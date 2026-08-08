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

      <!-- ── Profil Kartı ── -->
      <div class="profile-hero glass-card">
        <div class="profile-identity">
          <!-- Avatar -->
          <div class="customer-avatar-wrap">
            <img
              *ngIf="authService.currentUser()?.avatarUrl"
              [src]="authService.currentUser()?.avatarUrl"
              alt="Profil"
              class="customer-avatar-img"
            />
            <div
              *ngIf="!authService.currentUser()?.avatarUrl"
              class="customer-avatar-initial"
            >
              {{ getInitials() }}
            </div>
            <span class="online-dot"></span>
          </div>

          <!-- Bilgiler -->
          <div class="profile-info">
            <span class="badge badge-success mb-4">
              <i class="fa-solid fa-user-check"></i> MÜŞTERİ PORTALI
            </span>
            <h2 class="profile-name">{{ authService.currentUser()?.fullName }}</h2>
            <div class="profile-meta">
              <span *ngIf="authService.currentUser()?.email">
                <i class="fa-solid fa-envelope"></i>
                {{ authService.currentUser()?.email }}
              </span>
              <span *ngIf="authService.currentUser()?.phone">
                <i class="fa-solid fa-phone"></i>
                {{ authService.currentUser()?.phone }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sağ taraf aksiyonlar -->
        <div class="profile-actions">
          <a routerLink="/settings" class="btn btn-secondary">
            <i class="fa-solid fa-gear"></i> Profil Ayarları
          </a>
          <a
            href="https://wa.me/905325182234?text=Merhaba,%20sipari%C5%9Fim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
            target="_blank"
            class="btn-whatsapp-profile"
          >
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>
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

        <!-- Support & Billing Cards -->
        <div class="right-col-cards">
          <!-- Registered Billing & Address Card -->
          <div class="glass-card section-card">
            <div class="card-title-bar">
              <h3><i class="fa-solid fa-file-invoice"></i> Fatura & Adres Bilgileriniz</h3>
              <a routerLink="/settings" class="edit-link" title="Düzenle">
                <i class="fa-solid fa-pen-to-square"></i> Düzenle
              </a>
            </div>
            <div class="billing-summary-box">
              <div class="summary-item">
                <span class="sum-lbl">Müşteri Tipi & Unvan</span>
                <strong class="sum-val">Göktürk Tasarım & Reklam Ltd. Şti.</strong>
              </div>
              <div class="summary-item">
                <span class="sum-lbl">Vergi Dairesi / No</span>
                <span class="sum-val">Maslak V.D. - 1920839412</span>
              </div>
              <div class="summary-item">
                <span class="sum-lbl">Varsayılan Teslimat Adresi</span>
                <span class="sum-val muted-text">Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul</span>
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

    .right-col-cards {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .edit-link {
      font-size: 0.8rem;
      color: var(--secondary);
      text-decoration: none;
      font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px;
      transition: color var(--transition-fast);
    }
    .edit-link:hover { color: var(--primary); }

    .billing-summary-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .sum-lbl { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
    .sum-val { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .sum-val.muted-text { font-weight: 500; color: var(--text-muted); line-height: 1.4; }

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

    /* ── Profil Hero ── */
    .profile-hero {
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      background: linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(16,185,129,0.06) 100%);
    }

    .profile-identity {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    /* Customer Avatar */
    .customer-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .customer-avatar-img {
      width: 80px; height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--secondary);
      box-shadow: 0 0 0 5px var(--secondary-glow);
    }

    .customer-avatar-initial {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--secondary), var(--accent-emerald));
      color: #fff;
      font-weight: 900;
      font-size: 1.6rem;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid transparent;
      box-shadow: 0 0 0 5px var(--secondary-glow);
    }

    .online-dot {
      position: absolute; bottom: 3px; right: 3px;
      width: 14px; height: 14px;
      background: var(--status-success);
      border-radius: 50%;
      border: 2.5px solid var(--bg-secondary);
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .mb-4 { margin-bottom: 4px; }

    .profile-name {
      font-size: 1.6rem;
      font-weight: 800;
      font-family: var(--font-heading);
      margin: 0;
      line-height: 1.1;
    }

    .profile-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 4px;
    }

    .profile-meta span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .profile-meta i {
      font-size: 0.72rem;
      color: var(--secondary);
    }

    .profile-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-whatsapp-profile {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff; font-weight: 700; font-size: 0.88rem;
      text-decoration: none;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      box-shadow: 0 4px 14px rgba(37,211,102,0.25);
    }
    .btn-whatsapp-profile:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(37,211,102,0.35);
      color: #fff;
    }

    /* Skeleton */
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

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

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
