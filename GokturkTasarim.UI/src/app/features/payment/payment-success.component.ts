import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="payment-result-page animate-fadeIn">
      <div class="result-card glass-card success-theme">
        <!-- Animated Success Badge -->
        <div class="status-icon-wrap">
          <div class="pulse-ring"></div>
          <div class="icon-circle">
            <i class="fa-solid fa-circle-check"></i>
          </div>
        </div>

        <div class="result-header">
          <span class="badge badge-success-glow">
            <i class="fa-solid fa-shield-check"></i> PayTR 3D Secure Onaylandı
          </span>
          <h2>Ödemeniz Başarıyla Alındı!</h2>
          <p class="subtitle">Siparişiniz sisteme kaydedildi ve üretim sırasına alındı. Teşekkür ederiz.</p>
        </div>

        <!-- Order Information Box -->
        <div class="order-info-panel">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-lbl"><i class="fa-solid fa-hashtag text-primary"></i> Sipariş Numarası</span>
              <strong class="info-val code-highlight">{{ orderNumber() }}</strong>
            </div>

            <div class="info-item">
              <span class="info-lbl"><i class="fa-solid fa-calendar text-cyan"></i> İşlem Tarihi</span>
              <strong class="info-val">{{ currentDate }}</strong>
            </div>

            <div class="info-item">
              <span class="info-lbl"><i class="fa-solid fa-credit-card text-purple"></i> Ödeme Yöntemi</span>
              <strong class="info-val">PayTR 3D Secure (Kredi Kartı)</strong>
            </div>

            <div class="info-item">
              <span class="info-lbl"><i class="fa-solid fa-truck-fast text-emerald"></i> Tahmini Teslimat</span>
              <strong class="info-val text-emerald">2-3 İş Günü İçinde</strong>
            </div>
          </div>
        </div>

        <!-- Notification Note -->
        <div class="notification-box">
          <i class="fa-solid fa-envelope-circle-check text-cyan"></i>
          <p>Sipariş onayınız ve e-faturanız e-posta adresinize gönderildi. Sipariş durumunuzu müşteri panelinden anlık olarak takip edebilirsiniz.</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-group">
          <a [routerLink]="authService.isLoggedIn() ? '/customer' : '/projects'" class="btn btn-primary btn-lg">
            <i class="fa-solid" [class.fa-box-open]="authService.isLoggedIn()" [class.fa-layer-group]="!authService.isLoggedIn()"></i>
            {{ authService.isLoggedIn() ? 'Siparişlerimi Görüntüle' : 'Alışverişe Devam Et' }}
          </a>
          <a routerLink="/" class="btn btn-secondary btn-lg">
            <i class="fa-solid fa-house"></i> Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result-page {
      min-height: calc(100vh - 160px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .result-card {
      width: 100%;
      max-width: 680px;
      padding: 48px 36px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      border-radius: var(--radius-lg);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }

    .success-theme {
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1.5px solid rgba(16, 185, 129, 0.3);
    }

    /* Animated Icon */
    .status-icon-wrap {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.2);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(0.9); opacity: 0; }
    }

    .icon-circle {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
      position: relative;
      z-index: 1;
    }

    .result-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .badge-success-glow {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 0.84rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .result-header h2 {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-main);
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 480px;
      line-height: 1.5;
    }

    /* Order Info Panel */
    .order-info-panel {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      text-align: left;
    }

    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-lbl {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-val {
      font-size: 0.92rem;
      color: var(--text-main);
    }

    .code-highlight {
      font-family: monospace;
      color: var(--secondary);
      font-size: 1rem;
      letter-spacing: 0.5px;
    }

    /* Notification Box */
    .notification-box {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: var(--radius-md);
      text-align: left;
    }

    .notification-box i {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .notification-box p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Action Buttons */
    .action-buttons-group {
      display: flex;
      gap: 14px;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons-group .btn {
      flex: 1;
      min-width: 200px;
      justify-content: center;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);

  orderNumber = signal('GKT-ORD-2026');
  currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['orderNumber'] || params['merchant_oid']) {
        this.orderNumber.set(params['orderNumber'] || params['merchant_oid']);
      } else {
        const localOrders = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
        if (localOrders.length > 0) {
          this.orderNumber.set(localOrders[0].code);
        }
      }
    });
  }
}
