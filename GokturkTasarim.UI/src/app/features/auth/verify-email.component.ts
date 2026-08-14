import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-email-page animate-fadeIn">
      <div class="verify-card glass-card" [class.success-card]="status() === 'success'" [class.fail-card]="status() === 'error'">
        
        <!-- Loading State -->
        <div *ngIf="status() === 'loading'" class="verify-state-box">
          <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
          </div>
          <h3>E-Posta Adresiniz Doğrulanıyor...</h3>
          <p class="text-muted">Lütfen bekleyin, doğrulama anahtarı kontrol ediliyor.</p>
        </div>

        <!-- Success State -->
        <div *ngIf="status() === 'success'" class="verify-state-box">
          <div class="state-icon success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>E-Postanız Başarıyla Doğrulandı!</h3>
          <p class="text-muted">{{ message() }}</p>
          <div class="redirect-notice">
            <small><i class="fa-solid fa-clock"></i> Giriş ekranına yönlendiriliyorsunuz...</small>
          </div>
          <a routerLink="/login" class="btn btn-primary btn-lg">
            <i class="fa-solid fa-right-to-bracket"></i> Hemen Giriş Yap
          </a>
        </div>

        <!-- Error State -->
        <div *ngIf="status() === 'error'" class="verify-state-box">
          <div class="state-icon error-icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3>Doğrulama Yapılamadı</h3>
          <p class="text-danger-custom">{{ message() }}</p>
          <div class="btn-group-center">
            <a routerLink="/login" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-arrow-left"></i> Giriş Ekranına Dön
            </a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .verify-email-page {
      min-height: calc(100vh - 160px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
    }

    .verify-card {
      width: 100%;
      max-width: 520px;
      padding: 48px 36px;
      text-align: center;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .verify-state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-spinner {
      font-size: 3.5rem;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .state-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
      margin-bottom: 8px;
    }

    .success-icon {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.3);
    }

    .error-icon {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      box-shadow: 0 0 24px rgba(239, 68, 68, 0.3);
    }

    .success-card {
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
    }

    .fail-card {
      border: 1.5px solid rgba(239, 68, 68, 0.35);
      background: linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);
    }

    h3 {
      font-size: 1.45rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-main);
    }

    p {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .text-danger-custom {
      color: #f87171;
    }

    .redirect-notice {
      color: var(--text-dim);
      font-size: 0.82rem;
    }

    .btn-group-center {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal<string>('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.status.set('error');
        this.message.set('Geçersiz doğrulama bağlantısı: Doğrulama anahtarı (token) bulunamadı.');
        return;
      }

      this.verifyToken(token);
    });
  }

  private verifyToken(token: string): void {
    this.http.get<any>(`${environment.apiUrl}/auth/verify-email?token=${encodeURIComponent(token)}`).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res?.message || 'E-posta adresiniz başarıyla doğrulandı! Artık hesabınıza güvenle giriş yapabilirsiniz.');
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { verified: 'true' } });
        }, 3000);
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(err?.error?.message || 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.');
      }
    });
  }
}
