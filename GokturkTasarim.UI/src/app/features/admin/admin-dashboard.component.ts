import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AdminRequestDto } from '../../core/models/api-response.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <!-- Admin Hero Header -->
      <div class="admin-hero glass-card">
        <div class="hero-content">
          <span class="badge badge-primary">
            <i class="fa-solid fa-user-shield"></i> YETKİLİ ADMİN PANELİ
          </span>
          <h2>Hoş Geldin, <span class="gradient-text">{{ authService.currentUser()?.fullName }}</span></h2>
          <p class="text-muted">Göktürk Reklam & Tasarım platformu tek yetkili sistem yönetici paneli.</p>
        </div>

        <div class="admin-quick-stats">
          <div class="stat-pill">
            <i class="fa-solid fa-users"></i>
            <div>
              <span class="stat-num">
                {{ statsLoading ? '—' : stats().totalCustomers.toLocaleString('tr-TR') }}
              </span>
              <span class="stat-lbl">Kayıtlı Müşteri</span>
            </div>
          </div>
          <div class="stat-pill">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <div>
              <span class="stat-num">
                {{ statsLoading ? '—' : stats().pendingRequests }}
              </span>
              <span class="stat-lbl">Bekleyen Talep</span>
            </div>
          </div>
          <button class="refresh-btn" (click)="loadAll()" title="Yenile">
            <i class="fa-solid fa-arrows-rotate" [class.fa-spin]="tableLoading || statsLoading"></i>
          </button>
        </div>
      </div>

      <!-- Management Cards Grid -->
      <div class="admin-grid">
        <!-- Customer Requests Table -->
        <div class="glass-card table-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-list-check"></i> Son Müşteri Tasarım & Kurye Talepleri</h3>
            <button class="btn btn-outline-cyan btn-sm">
              <i class="fa-solid fa-download"></i> Dışa Aktar
            </button>
          </div>

          <!-- Loading skeleton rows -->
          <div *ngIf="tableLoading" class="skeleton-rows">
            <div class="skel-row" *ngFor="let s of [1,2,3]">
              <div class="skel-cell sm"></div>
              <div class="skel-cell md"></div>
              <div class="skel-cell lg"></div>
              <div class="skel-cell sm"></div>
              <div class="skel-cell badge-skel"></div>
            </div>
          </div>

          <div class="table-responsive" *ngIf="!tableLoading">
            <!-- Empty state -->
            <div *ngIf="requests().length === 0" class="empty-table">
              <i class="fa-solid fa-inbox"></i>
              <p>Henüz müşteri talebi bulunmuyor.</p>
            </div>

            <table class="admin-table" *ngIf="requests().length > 0">
              <thead>
                <tr>
                  <th>Talep / ID</th>
                  <th>Müşteri Adı</th>
                  <th>Hizmet Türü</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of requests()">
                  <td class="font-mono">{{ req.id }}</td>
                  <td class="font-bold">{{ req.customer }}</td>
                  <td>{{ req.service }}</td>
                  <td class="text-muted">{{ req.date }}</td>
                  <td><span class="badge" [ngClass]="req.statusClass">{{ req.status }}</span></td>
                  <td>
                    <button class="action-btn" title="Onayla"><i class="fa-solid fa-check text-success"></i></button>
                    <button class="action-btn" title="Detay"><i class="fa-solid fa-eye text-primary"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- System Controls & Audit Log -->
        <div class="glass-card controls-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-sliders"></i> Admin Yetki & Sistem Denetimi</h3>
          </div>

          <div class="control-list">
            <div class="control-item">
              <div class="ctrl-info">
                <strong>Aktif Oturum</strong>
                <p>{{ authService.currentUser()?.email || 'admin@gokturk.com' }}</p>
              </div>
              <span class="badge badge-success">Aktif</span>
            </div>

            <div class="control-item">
              <div class="ctrl-info">
                <strong>Sistem Güvenliği</strong>
                <p>Şifreli Bağlantı (HTTPS)</p>
              </div>
              <span class="badge badge-primary">Aktif</span>
            </div>

            <div class="control-item">
              <div class="ctrl-info">
                <strong>Veri Tabanı</strong>
                <p>Tam Senkronize & Güncel</p>
              </div>
              <span class="badge badge-success">Güncel</span>
            </div>

            <div class="control-item">
              <div class="ctrl-info">
                <strong>Yetkilendirme</strong>
                <p>Güvenli Oturum Yönetimi</p>
              </div>
              <span class="badge badge-primary">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .admin-hero {
      padding: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%);
      flex-wrap: wrap;
    }

    .hero-content h2 {
      font-size: 1.8rem;
      margin: 8px 0;
    }

    .admin-quick-stats {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .stat-pill {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      padding: 12px 20px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .stat-pill i {
      font-size: 1.6rem;
      color: var(--accent-purple);
    }

    .stat-num {
      display: block;
      font-size: 1.25rem;
      font-weight: 800;
      font-family: var(--font-heading);
    }

    .stat-lbl {
      font-size: 0.76rem;
      color: var(--text-muted);
    }

    .refresh-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.88rem;
      padding: 8px 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover { color: var(--secondary); border-color: var(--secondary); }

    .admin-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 992px) {
      .admin-grid { grid-template-columns: 1fr; }
      .admin-hero { flex-direction: column; align-items: flex-start; }
    }

    .table-card, .controls-card {
      padding: 24px;
    }

    .card-title-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--glass-border);
    }

    .card-title-bar h3 {
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }

    .admin-table th {
      text-align: left;
      padding: 10px 12px;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--glass-border);
    }

    .admin-table td {
      padding: 12px;
      border-bottom: 1px solid var(--glass-border);
    }

    .font-mono { font-family: monospace; color: var(--secondary); }
    .font-bold { font-weight: 600; }
    .text-success { color: var(--status-success); }
    .text-primary { color: var(--primary); }

    .action-btn {
      background: transparent;
      border: none;
      font-size: 1.05rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: var(--bg-card-hover);
    }

    /* Skeleton loading */
    .skeleton-rows { display: flex; flex-direction: column; gap: 12px; }
    .skel-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--glass-border); }
    .skel-cell {
      height: 14px; border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skel-cell.sm { width: 60px; }
    .skel-cell.md { width: 100px; }
    .skel-cell.lg { width: 180px; }
    .skel-cell.badge-skel { width: 70px; height: 22px; border-radius: 9999px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Empty state */
    .empty-table {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 32px; text-align: center;
    }
    .empty-table i { font-size: 2rem; color: var(--text-dim); }
    .empty-table p { font-size: 0.88rem; color: var(--text-muted); margin: 0; }

    .control-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .control-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }

    .ctrl-info strong {
      display: block;
      font-size: 0.88rem;
    }

    .ctrl-info p {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  requests = signal<AdminRequestDto[]>([]);
  stats = signal<{ totalCustomers: number; pendingRequests: number }>({ totalCustomers: 0, pendingRequests: 0 });
  tableLoading = false;
  statsLoading = false;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadRequests();
    this.loadStats();
  }

  loadRequests(): void {
    this.tableLoading = true;
    this.apiService.getAdminRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.tableLoading = false;
      },
      error: () => {
        this.tableLoading = false;
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.apiService.getAdminStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }
}
