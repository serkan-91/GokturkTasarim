import { Component, Output, EventEmitter, inject } from '@angular/core';
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
        <!-- Quick Contact Pill -->
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

        <!-- Theme Toggle Button (Gece / Gündüz Mode) -->
        <button class="theme-toggle-btn" (click)="themeService.toggleTheme()" [title]="themeService.currentTheme() === 'dark' ? 'Gündüz Temasına Geç' : 'Gece Temasına Geç'">
          <i class="fa-solid" [ngClass]="themeService.currentTheme() === 'dark' ? 'fa-sun icon-sun' : 'fa-moon icon-moon'"></i>
          <span class="theme-text">{{ themeService.currentTheme() === 'dark' ? 'Gece' : 'Gündüz' }}</span>
        </button>

        <!-- User Authentication Section -->
        <ng-container *ngIf="authService.isLoggedIn(); else guestActions">
          <div class="user-profile">
            <div class="avatar" [ngClass]="authService.isAdmin() ? 'avatar-admin' : 'avatar-customer'">
              {{ authService.isAdmin() ? 'AD' : 'MŞ' }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
              <span class="badge" [ngClass]="authService.isAdmin() ? 'badge-primary' : 'badge-success'">
                {{ authService.isAdmin() ? 'YETKİLİ ADMİN' : 'MÜŞTERİ' }}
              </span>
            </div>
          </div>

          <button class="btn btn-logout" (click)="authService.logout()" title="Çıkış Yap">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </ng-container>

        <!-- Guest Actions -->
        <ng-template #guestActions>
          <a routerLink="/login" class="btn btn-primary btn-login-nav">
            <i class="fa-solid fa-right-to-bracket"></i> Giriş Yap
          </a>
        </ng-template>
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
      z-index: 100;
      transition: background-color var(--transition-slow), border-color var(--transition-slow);
      animation: slideUp 0.3s ease;
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

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

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo-img {
      height: 38px;
      border-radius: var(--radius-sm);
      object-fit: contain;
      background: rgba(255, 255, 255, 0.95);
      padding: 3px 8px;
      box-shadow: 0 4px 14px var(--primary-glow);
      border: 1px solid var(--glass-border);
      transition: transform 0.25s ease;
    }

    .brand-logo-img:hover {
      transform: scale(1.04);
    }

    /* Quick Contact Pill */
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

    .pill-divider {
      color: var(--glass-border);
      font-size: 0.9rem;
    }

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

    .theme-toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      padding: 7px 14px;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.25s ease;
    }

    .theme-toggle-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--glass-border-hover);
      transform: translateY(-1px);
    }

    .icon-sun { color: #f59e0b; font-size: 1.05rem; }
    .icon-moon { color: #818cf8; font-size: 1rem; }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 12px;
      border-left: 1px solid var(--glass-border);
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-admin {
      background: linear-gradient(135deg, var(--accent-purple) 0%, var(--primary) 100%);
      box-shadow: 0 0 10px var(--primary-glow);
    }

    .avatar-customer {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--accent-emerald) 100%);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.1;
    }

    .btn-logout {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: var(--status-danger);
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 50%;
    }

    .btn-logout:hover {
      background: var(--status-danger);
      color: #fff;
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
}
