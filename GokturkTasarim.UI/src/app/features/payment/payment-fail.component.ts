import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="payment-result-page animate-fadeIn">
      <div class="result-card glass-card fail-theme">
        <!-- Animated Failure Badge -->
        <div class="status-icon-wrap">
          <div class="pulse-ring-fail"></div>
          <div class="icon-circle fail-circle">
            <i class="fa-solid fa-circle-xmark"></i>
          </div>
        </div>

        <div class="result-header">
          <span class="badge badge-fail-glow">
            <i class="fa-solid fa-triangle-exclamation"></i> İşlem Tamamlanamadı
          </span>
          <h2>Ödeme Gerçekleştirilemedi</h2>
          <p class="subtitle">{{ failureReason() }}</p>
        </div>

        <!-- Failure Tips Box -->
        <div class="fail-tips-panel">
          <h4><i class="fa-solid fa-lightbulb text-amber"></i> Olası Nedenler & Çözüm Önerileri:</h4>
          <ul class="tips-list">
            <li><i class="fa-solid fa-check text-muted"></i> Kartınızın internet alışveriş limitini ve 3D Secure onayını kontrol ediniz.</li>
            <li><i class="fa-solid fa-check text-muted"></i> Kart bilgilerinizi (Son Kullanma Tarihi ve CVV) kontrol ederek tekrar deneyebilirsiniz.</li>
            <li><i class="fa-solid fa-check text-muted"></i> Dilerseniz <strong>%5 İskontolu Banka Havalesi / EFT</strong> seçeneğini tercih edebilirsiniz.</li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons-group">
          <a routerLink="/checkout" class="btn btn-primary btn-lg">
            <i class="fa-solid fa-rotate-right"></i> Ödemeyi Tekrar Dene
          </a>
          <a routerLink="/contact" class="btn btn-secondary btn-lg">
            <i class="fa-solid fa-headset"></i> Destek İle İletişime Geç
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

    .fail-theme {
      background: linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1.5px solid rgba(239, 68, 68, 0.3);
    }

    .status-icon-wrap {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pulse-ring-fail {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      animation: pulseFail 2s infinite;
    }

    @keyframes pulseFail {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(0.9); opacity: 0; }
    }

    .icon-circle.fail-circle {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
      position: relative;
      z-index: 1;
    }

    .result-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .badge-fail-glow {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
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

    /* Tips Panel */
    .fail-tips-panel {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 22px;
      text-align: left;
    }

    .fail-tips-panel h4 {
      margin: 0 0 14px 0;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 0.86rem;
      color: var(--text-muted);
    }

    .tips-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      line-height: 1.4;
    }

    .tips-list li i {
      margin-top: 2px;
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
export class PaymentFailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  failureReason = signal('Banka kartınız ile yapılan ödeme işlemi onaylanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] || params['failed_reason_msg']) {
        this.failureReason.set(params['reason'] || params['failed_reason_msg']);
      }
    });
  }
}
