import { Component, Output, EventEmitter, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="header-left">
        <button class="toggle-btn" (click)="toggleSidebar.emit()" title="Menüyü Aç/Kapat">
          <i class="fa-solid fa-bars-staggered"></i>
        </button>
        <div class="brand" routerLink="/" style="cursor: pointer;">
          <img src="logo.jpg" alt="Göktürk Reklam Logo" class="brand-logo-img" />
        </div>
      </div>

      <div class="header-right">
        <!-- Quick Contact Pill (masaüstü) -->
        <div class="quick-contact-pill">
          <i class="fa-solid fa-phone-volume pulse-phone"></i>
          <a href="tel:+905325182234" class="contact-num">0 532 518 22 34</a>
          <span class="pill-divider">|</span>
          <a
            href="https://wa.me/905325182234?text=Merhaba,%20bilgi%20almak%20istiyorum."
            target="_blank"
            class="wa-link"
            title="WhatsApp'tan yaz"
          >
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>


        <!-- Giriş yapılmamış — Giriş Yap butonu -->
        <ng-container *ngIf="!authService.isLoggedIn()">
          <a routerLink="/login" class="btn btn-primary btn-login-nav">
            <i class="fa-solid fa-right-to-bracket"></i> Giriş Yap
          </a>
        </ng-container>

        <!-- Giriş yapılmış — profil dropdown -->
        <ng-container *ngIf="authService.isLoggedIn()">
          <div class="profile-wrap">
            <!-- Avatar butonu -->
            <button class="avatar-btn" (click)="toggleProfile()">
              <!-- Profil resmi varsa göster -->
              <img
                *ngIf="authService.currentUser()?.avatarUrl"
                [src]="authService.currentUser()?.avatarUrl"
                alt="Profil"
                class="avatar-img"
              />
              <!-- Yoksa initial -->
              <div
                *ngIf="!authService.currentUser()?.avatarUrl"
                class="avatar-initial"
                [ngClass]="authService.isAdmin() ? 'avatar-admin' : 'avatar-customer'"
              >
                {{ getInitials() }}
              </div>
              <!-- Çevrimiçi dot -->
              <span class="online-dot"></span>
            </button>

            <!-- Dropdown menü -->
            <div class="profile-dropdown" [class.open]="profileOpen()">
              <!-- Dropdown header -->
              <div class="dropdown-header">
                <div class="dropdown-avatar-wrap">
                  <img
                    *ngIf="authService.currentUser()?.avatarUrl"
                    [src]="authService.currentUser()?.avatarUrl"
                    alt="Profil"
                    class="dropdown-avatar-img"
                  />
                  <div
                    *ngIf="!authService.currentUser()?.avatarUrl"
                    class="dropdown-avatar-initial"
                    [ngClass]="authService.isAdmin() ? 'avatar-admin' : 'avatar-customer'"
                  >
                    {{ getInitials() }}
                  </div>
                </div>
                <div class="dropdown-user-info">
                  <span class="dropdown-name">{{ authService.currentUser()?.fullName }}</span>
                  <span class="dropdown-email">{{ authService.currentUser()?.email }}</span>
                  <span class="badge mt-2" [ngClass]="authService.isAdmin() ? 'badge-primary' : 'badge-success'">
                    {{ authService.isAdmin() ? 'Yönetici' : 'Müşteri' }}
                  </span>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <!-- Dropdown linkleri -->
              <a
                [routerLink]="authService.isAdmin() ? '/admin' : '/customer'"
                class="dropdown-item"
                (click)="profileOpen.set(false)"
              >
                <i class="fa-solid fa-gauge-high"></i>
                {{ authService.isAdmin() ? 'Admin Paneli' : 'Siparişlerim' }}
              </a>

              <a routerLink="/settings" class="dropdown-item" (click)="profileOpen.set(false)">
                <i class="fa-solid fa-gear"></i>
                Hesap Ayarları
              </a>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item danger" (click)="authService.logout(); profileOpen.set(false)">
                <i class="fa-solid fa-power-off"></i>
                Çıkış Yap
              </button>
            </div>
          </div>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 70px;
      background: var(--bg-secondary);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 200;
      transition: background-color var(--transition-slow), border-color var(--transition-slow);
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* ── Sidebar Toggle ── */
    .toggle-btn {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .toggle-btn:hover {
      background: var(--bg-card-hover);
      color: var(--primary);
      border-color: var(--glass-border-hover);
    }

    /* ── Brand ── */
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo-img {
      height: 38px;
      border-radius: var(--radius-sm);
      object-fit: contain;
      background: rgba(255,255,255,0.95);
      padding: 3px 8px;
      box-shadow: 0 4px 14px var(--primary-glow);
      border: 1px solid var(--glass-border);
      transition: transform 0.25s ease;
    }
    .brand-logo-img:hover { transform: scale(1.04); }

    /* ── Contact Pill ── */
    .quick-contact-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 7px 16px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .pulse-phone {
      color: var(--accent-emerald);
      font-size: 0.9rem;
      animation: pulse-glow 2.5s infinite ease-in-out;
    }
    .contact-num {
      color: var(--text-main);
      font-weight: 700;
      font-size: 0.84rem;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .contact-num:hover { color: var(--accent-emerald); }
    .pill-divider { color: var(--glass-border); font-size: 0.9rem; }
    .wa-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #25D366;
      font-weight: 700;
      font-size: 0.82rem;
      text-decoration: none;
      transition: color var(--transition-fast), transform var(--transition-fast);
    }
    .wa-link:hover { color: #1eac55; transform: translateY(-1px); }
    .wa-link i { font-size: 1rem; }

    @media (max-width: 768px) {
      .quick-contact-pill { display: none; }
    }

    /* ── Icon Button (tema vb.) ── */
    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
      background: var(--bg-card);
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all var(--transition-fast);
    }
    .icon-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--glass-border-hover);
      transform: translateY(-1px);
    }
    .icon-sun { color: #f59e0b; }
    .icon-moon { color: #818cf8; }

    /* ── Profil Wrap ── */
    .profile-wrap {
      position: relative;
    }

    /* Avatar butonu */
    .avatar-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .avatar-btn:hover .avatar-img {
      transform: scale(1.06);
      box-shadow: 0 0 0 4px var(--primary-glow);
    }

    .avatar-initial {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid transparent;
      transition: transform var(--transition-fast);
    }
    .avatar-btn:hover .avatar-initial { transform: scale(1.06); }

    .avatar-admin {
      background: linear-gradient(135deg, var(--accent-purple), var(--primary));
      box-shadow: 0 0 12px var(--primary-glow);
    }
    .avatar-customer {
      background: linear-gradient(135deg, var(--secondary), var(--accent-emerald));
      box-shadow: 0 0 12px var(--secondary-glow);
    }

    /* Online dot */
    .online-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      background: var(--status-success);
      border-radius: 50%;
      border: 2px solid var(--bg-secondary);
    }

    /* ── Dropdown ── */
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 260px;
      background: var(--bg-secondary);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 48px rgba(0,0,0,0.4);
      overflow: hidden;
      opacity: 0;
      transform: translateY(-8px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      z-index: 300;
    }
    .profile-dropdown.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Dropdown header */
    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 16px;
      background: rgba(99,102,241,0.06);
    }

    .dropdown-avatar-wrap { position: relative; flex-shrink: 0; }

    .dropdown-avatar-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary);
    }

    .dropdown-avatar-initial {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      color: #fff;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dropdown-user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .dropdown-name {
      font-size: 0.9rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dropdown-email {
      font-size: 0.72rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mt-2 { margin-top: 4px; }

    /* Dropdown items */
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      font-size: 0.86rem;
      font-weight: 500;
      color: var(--text-main);
      text-decoration: none;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
    }
    .dropdown-item i { width: 16px; text-align: center; color: var(--text-dim); font-size: 0.85rem; }
    .dropdown-item:hover { background: rgba(99,102,241,0.08); color: var(--primary); }
    .dropdown-item:hover i { color: var(--primary); }
    .dropdown-item.danger { color: var(--status-danger); }
    .dropdown-item.danger i { color: var(--status-danger); }
    .dropdown-item.danger:hover { background: rgba(239,68,68,0.08); }

    .dropdown-divider {
      height: 1px;
      background: var(--glass-border);
      margin: 4px 0;
    }

    .btn-login-nav {
      padding: 8px 18px;
      font-size: 0.88rem;
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  private elRef = inject(ElementRef);

  profileOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.querySelector('.profile-wrap')?.contains(event.target)) {
      this.profileOpen.set(false);
    }
  }

  toggleProfile(): void {
    this.profileOpen.update(v => !v);
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
