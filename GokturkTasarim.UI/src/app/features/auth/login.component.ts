import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Only show demo credentials on localhost/development environments
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card glass-card">
        <!-- Logo & Header -->
        <div class="login-header">
          <img src="logo.jpg" alt="Göktürk Reklam Logo" class="login-logo" />
          <h2>Göktürk Portal</h2>
          <p class="text-muted">Müşteri ve Admin hesaplarınız için güvenli giriş ekranı.</p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab-btn" [class.active]="activeTab() === 'login'" (click)="setTab('login')">
            <i class="fa-solid fa-right-to-bracket"></i> Giriş Yap
          </button>
          <button class="auth-tab-btn" [class.active]="activeTab() === 'register'" (click)="setTab('register')">
            <i class="fa-solid fa-user-plus"></i> Hesap Oluştur
          </button>
        </div>

        <!-- Alert Messages -->
        <div *ngIf="errorMessage" class="error-alert">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <div *ngIf="successMessage" class="success-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ successMessage }}</span>
        </div>

        <!-- LOGIN FORM -->
        <form *ngIf="activeTab() === 'login'" (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="email"><i class="fa-solid fa-envelope"></i> E-Posta Adresi</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              class="form-control"
              placeholder="admin@gokturk.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password"><i class="fa-solid fa-lock"></i> Parola</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              class="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <i class="fa-solid fa-right-to-bracket" *ngIf="!loading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="loading"></i>
            {{ loading ? 'Giriş yapılıyor...' : 'Güvenli Giriş Yap' }}
          </button>
        </form>

        <!-- REGISTER FORM -->
        <form *ngIf="activeTab() === 'register'" (ngSubmit)="onRegister()" class="login-form">
          <div class="form-group">
            <label for="regFullName"><i class="fa-solid fa-user"></i> Ad Soyad</label>
            <input
              type="text"
              id="regFullName"
              name="regFullName"
              [(ngModel)]="regFullName"
              class="form-control"
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>

          <div class="form-group">
            <label for="regEmail"><i class="fa-solid fa-envelope"></i> E-Posta Adresi</label>
            <input
              type="email"
              id="regEmail"
              name="regEmail"
              [(ngModel)]="regEmail"
              class="form-control"
              placeholder="ornek@sirket.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="regPhone"><i class="fa-solid fa-phone"></i> Telefon</label>
            <input
              type="tel"
              id="regPhone"
              name="regPhone"
              [(ngModel)]="regPhone"
              class="form-control"
              placeholder="05xx xxx xx xx"
            />
          </div>

          <div class="form-group">
            <label for="regPassword"><i class="fa-solid fa-lock"></i> Parola</label>
            <input
              type="password"
              id="regPassword"
              name="regPassword"
              [(ngModel)]="regPassword"
              class="form-control"
              placeholder="En az 6 karakter"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <i class="fa-solid fa-user-plus" *ngIf="!loading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="loading"></i>
            {{ loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur' }}
          </button>
        </form>

        <!-- Email Verification Preview Box (if register completed) -->
        <div *ngIf="emailVerificationUrl" class="email-preview-box glass-card">
          <span class="preview-title"><i class="fa-solid fa-envelope-circle-check"></i> E-Posta Onay Şablonu (Simülasyon)</span>
          <p>Kayıt tamamlandı. E-posta doğrulama linki oluşturuldu:</p>
          <a [href]="emailVerificationUrl" target="_blank" class="btn-verify-sim">
            <i class="fa-solid fa-square-check"></i> E-Postayı Doğrula
          </a>
        </div>

        <!-- Quick Demo Credentials Box — Only visible in development/localhost -->
        <div *ngIf="activeTab() === 'login' && isDev" class="quick-demo-box">
          <span class="demo-title"><i class="fa-solid fa-key"></i> Hızlı Test Hesapları (Yalnızca Geliştirme)</span>
          <div class="demo-buttons">
            <button class="btn-demo demo-admin" (click)="fillAdminCredentials()">
              <i class="fa-solid fa-user-shield"></i> Admin Girişi Doldur
            </button>
            <button class="btn-demo demo-customer" (click)="fillCustomerCredentials()">
              <i class="fa-solid fa-user"></i> Müşteri Girişi Doldur
            </button>
          </div>
          <div class="demo-hint">
            <small><i class="fa-solid fa-triangle-exclamation"></i> Bu bölüm yalnızca geliştirme ortamında görünür.</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 150px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 460px;
      padding: 36px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .login-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .login-logo {
      height: 46px;
      object-fit: contain;
      background: rgba(255, 255, 255, 0.95);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .login-header h2 { font-size: 1.45rem; margin: 0; }
    .login-header p { font-size: 0.84rem; line-height: 1.4; margin: 0; }

    /* Auth Mode Tabs */
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .auth-tab-btn {
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.84rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .auth-tab-btn.active {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--status-danger);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.86rem;
    }

    .success-alert {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--status-success);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.86rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-control {
      padding: 11px 15px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 12px var(--primary-glow);
    }

    .btn-block {
      width: 100%;
      padding: 12px;
      font-size: 0.95rem;
      justify-content: center;
    }

    .email-preview-box {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(6, 182, 212, 0.1) !important;
      border-color: rgba(6, 182, 212, 0.3) !important;
    }

    .preview-title {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.04em;
    }

    .btn-verify-sim {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, var(--secondary), var(--primary));
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: var(--radius-md);
      text-decoration: none;
    }

    .quick-demo-box {
      border-top: 1px solid var(--glass-border);
      padding-top: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-title {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .demo-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-demo {
      padding: 8px 12px;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border);
      background: var(--bg-card);
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .demo-admin:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: var(--accent-purple);
      color: var(--accent-purple);
    }

    .demo-customer:hover {
      background: rgba(6, 182, 212, 0.2);
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .demo-hint {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.75rem;
      line-height: 1.5;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'login' | 'register'>('login');
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Development-only flag — hides demo credentials in production
  readonly isDev = isDevelopment;

  // ReturnUrl after login
  private returnUrl = '/';

  // Login Form
  email = '';
  password = '';

  // Register Form
  regFullName = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';
  emailVerificationUrl = '';

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'unauthorized') {
        this.errorMessage = 'Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen Admin hesabınızla giriş yapınız.';
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  setTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Lütfen e-posta ve şifrenizi giriniz.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        this.loading = false;
        // Navigate to returnUrl if available, otherwise role-based default
        const defaultRoute = user.role === 'Admin' ? '/admin' : '/customer';
        const target = this.returnUrl !== '/' ? this.returnUrl : defaultRoute;
        this.router.navigateByUrl(target);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      }
    });
  }

  onRegister(): void {
    if (!this.regFullName || !this.regEmail || !this.regPassword) {
      this.errorMessage = 'Lütfen zorunlu alanları doldurunuz.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      fullName: this.regFullName,
      email: this.regEmail,
      password: this.regPassword,
      phone: this.regPhone
    }).subscribe({
      next: res => {
        this.loading = false;
        this.successMessage = res.message;
        if (res.verificationUrl) {
          this.emailVerificationUrl = res.verificationUrl;
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Kayıt işlemi başarısız.';
      }
    });
  }

  // Development-only helpers — only callable from template when isDev is true
  fillAdminCredentials(): void {
    if (!this.isDev) return;
    this.email = 'admin@gokturk.com';
    this.password = 'Admin123!';
    this.errorMessage = '';
  }

  fillCustomerCredentials(): void {
    if (!this.isDev) return;
    this.email = 'musteri@gokturk.com';
    this.password = 'Musteri123!';
    this.errorMessage = '';
  }
}
