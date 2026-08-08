import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

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
              <span class="stat-num">1.240</span>
              <span class="stat-lbl">Kayıtlı Müşteri</span>
            </div>
          </div>
          <div class="stat-pill">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <div>
              <span class="stat-num">18</span>
              <span class="stat-lbl">Bekleyen Talep</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Cards Grid -->
      <div class="admin-grid">
        <!-- Customer Requests Table -->
        <div class="glass-card table-card">
          <div class="card-title-bar">
            <h3><i class="fa-solid fa-list-check"></i> Son Müşteri Tasarım & Kurye Talepleri</h3>
            <button class="btn btn-outline-cyan btn-sm"><i class="fa-solid fa-download"></i> Dışa Aktar</button>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tep / ID</th>
                  <th>Müşteri Adı</th>
                  <th>Hizmet Türü</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of requests">
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
                <strong>Tek Yetkili Admin</strong>
                <p>admin&#64;gokturk.com</p>
              </div>
              <span class="badge badge-success">Aktif Oturum</span>
            </div>

            <div class="control-item">
              <div class="ctrl-info">
                <strong>.NET API Güvenliği</strong>
                <p>CORS & HTTPS Yetkisi</p>
              </div>
              <span class="badge badge-primary">Aktif</span>
            </div>

            <div class="control-item">
              <div class="ctrl-info">
                <strong>Veritabanı Senkronizasyonu</strong>
                <p>EF Core Migration</p>
              </div>
              <span class="badge badge-success">Güncel</span>
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
    }

    .hero-content h2 {
      font-size: 1.8rem;
      margin: 8px 0;
    }

    .admin-quick-stats {
      display: flex;
      gap: 16px;
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

    .admin-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    @media (max-width: 992px) {
      .admin-grid {
        grid-template-columns: 1fr;
      }
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
    }
  `]
})
export class AdminDashboardComponent {
  public authService = inject(AuthService);

  requests = [
    { id: 'TLP-801', customer: 'Ahmet Yılmaz', service: 'Tabela & Reklam Baskı', date: '08.08.2026', status: 'Onay Bekliyor', statusClass: 'badge-warning' },
    { id: 'TLP-802', customer: 'Mehmet Demir', service: 'Motorlu Kurye Hizmeti', date: '08.08.2026', status: 'Tamamlandı', statusClass: 'badge-success' },
    { id: 'TLP-803', customer: 'Ayşe Kaya', service: 'Kurumsal Promosyon Ürünleri', date: '07.08.2026', status: 'İşlemde', statusClass: 'badge-primary' }
  ];
}
