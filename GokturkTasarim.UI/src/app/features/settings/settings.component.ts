import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <span class="badge badge-primary">
            <i class="fa-solid fa-gear"></i> AYARLAR
          </span>
          <h2 class="page-title">Hesap & Tercihler</h2>
          <p class="text-muted">Görünüm, bildirim ve iletişim tercihlerinizi yönetin.</p>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="settings-grid">

        <!-- Appearance Card -->
        <div class="glass-card settings-card">
          <div class="card-header">
            <div class="card-icon icon-purple">
              <i class="fa-solid fa-palette"></i>
            </div>
            <div>
              <h3>Görünüm</h3>
              <p class="text-muted">Tema ve arayüz ayarları</p>
            </div>
          </div>

          <div class="setting-rows">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Tema Modu</span>
                <span class="setting-desc">Gece veya gündüz teması seçin</span>
              </div>
              <div class="theme-toggle-group">
                <button
                  class="theme-opt"
                  [class.active]="themeService.currentTheme() === 'dark'"
                  (click)="setTheme('dark')"
                >
                  <i class="fa-solid fa-moon"></i> Gece
                </button>
                <button
                  class="theme-opt"
                  [class.active]="themeService.currentTheme() === 'light'"
                  (click)="setTheme('light')"
                >
                  <i class="fa-solid fa-sun"></i> Gündüz
                </button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">Animasyonlar</span>
                <span class="setting-desc">Geçiş ve mikro animasyonları</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="animationsEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Account Info Card -->
        <div class="glass-card settings-card">
          <div class="card-header">
            <div class="card-icon icon-cyan">
              <i class="fa-solid fa-circle-user"></i>
            </div>
            <div>
              <h3>Hesap Bilgileri</h3>
              <p class="text-muted">Kayıtlı bilgileriniz</p>
            </div>
          </div>

          <div class="account-info-list">
            <div class="info-row" *ngIf="user()">
              <i class="fa-solid fa-user info-icon"></i>
              <div>
                <span class="info-label">Ad Soyad</span>
                <span class="info-val">{{ user()?.fullName || '—' }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="user()">
              <i class="fa-solid fa-envelope info-icon"></i>
              <div>
                <span class="info-label">E-Posta</span>
                <span class="info-val">{{ user()?.email || '—' }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="user()">
              <i class="fa-solid fa-phone info-icon"></i>
              <div>
                <span class="info-label">Telefon</span>
                <span class="info-val">{{ user()?.phone || '—' }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="user()">
              <i class="fa-solid fa-id-badge info-icon"></i>
              <div>
                <span class="info-label">Rol</span>
                <span class="badge" [ngClass]="user()?.role === 'Admin' ? 'badge-primary' : 'badge-success'">
                  {{ user()?.role === 'Admin' ? 'Yönetici' : 'Müşteri' }}
                </span>
              </div>
            </div>

            <div class="info-row not-logged" *ngIf="!user()">
              <i class="fa-solid fa-lock info-icon"></i>
              <div>
                <span class="info-label">Giriş Yapılmadı</span>
                <span class="info-val">Hesap bilgilerini görmek için giriş yapın</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Card -->
        <div class="glass-card settings-card">
          <div class="card-header">
            <div class="card-icon icon-emerald">
              <i class="fa-solid fa-bell"></i>
            </div>
            <div>
              <h3>Bildirimler</h3>
              <p class="text-muted">Hangi kanallardan ulaşalım?</p>
            </div>
          </div>

          <div class="setting-rows">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">
                  <i class="fa-brands fa-whatsapp" style="color:#25D366"></i> WhatsApp Bildirimleri
                </span>
                <span class="setting-desc">Sipariş durumu WhatsApp ile bildirilsin</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="whatsappNotif" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">
                  <i class="fa-solid fa-envelope" style="color:var(--accent-purple)"></i> E-Posta Bildirimleri
                </span>
                <span class="setting-desc">Sipariş onayı ve güncellemelerini e-posta al</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="emailNotif" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">
                  <i class="fa-solid fa-tag" style="color:var(--status-warning)"></i> Kampanya Bildirimleri
                </span>
                <span class="setting-desc">İndirim ve fırsatlardan haberdar olun</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="campaignNotif" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Contact Preference Card -->
        <div class="glass-card settings-card">
          <div class="card-header">
            <div class="card-icon icon-amber">
              <i class="fa-solid fa-comments"></i>
            </div>
            <div>
              <h3>İletişim Tercihi</h3>
              <p class="text-muted">Size nasıl ulaşmamızı istersiniz?</p>
            </div>
          </div>

          <div class="contact-pref-list">
            <label class="pref-radio" [class.selected]="contactPref === 'whatsapp'">
              <input type="radio" name="pref" value="whatsapp" [(ngModel)]="contactPref" />
              <div class="pref-icon" style="background: rgba(37,211,102,0.1); color: #25D366;">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <div class="pref-info">
                <span class="pref-name">WhatsApp</span>
                <span class="pref-desc">Mesaj / görüntülü görüşme</span>
              </div>
              <i class="fa-solid fa-circle-check pref-check"></i>
            </label>

            <label class="pref-radio" [class.selected]="contactPref === 'phone'">
              <input type="radio" name="pref" value="phone" [(ngModel)]="contactPref" />
              <div class="pref-icon" style="background: rgba(6,182,212,0.1); color: var(--secondary);">
                <i class="fa-solid fa-phone"></i>
              </div>
              <div class="pref-info">
                <span class="pref-name">Telefon</span>
                <span class="pref-desc">Sizi arayalım</span>
              </div>
              <i class="fa-solid fa-circle-check pref-check"></i>
            </label>

            <label class="pref-radio" [class.selected]="contactPref === 'email'">
              <input type="radio" name="pref" value="email" [(ngModel)]="contactPref" />
              <div class="pref-icon" style="background: rgba(168,85,247,0.1); color: var(--accent-purple);">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div class="pref-info">
                <span class="pref-name">E-Posta</span>
                <span class="pref-desc">E-posta ile dönüş yapalım</span>
              </div>
              <i class="fa-solid fa-circle-check pref-check"></i>
            </label>
          </div>

          <button class="btn btn-primary btn-save" (click)="savePreferences()">
            <i class="fa-solid" [ngClass]="saved ? 'fa-check' : 'fa-floppy-disk'"></i>
            {{ saved ? 'Kaydedildi!' : 'Tercihleri Kaydet' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Page Header */
    .page-header { display: flex; align-items: flex-start; gap: 16px; }
    .page-title { font-size: 1.7rem; font-weight: 800; margin: 8px 0 4px; font-family: var(--font-heading); }

    /* Settings Grid */
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }

    /* Card */
    .settings-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      animation: slideUp 0.35s ease;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);
    }

    .card-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 3px;
    }

    .card-header p { margin: 0; font-size: 0.8rem; }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .icon-purple { background: rgba(168, 85, 247, 0.15); color: var(--accent-purple); }
    .icon-cyan { background: rgba(6, 182, 212, 0.15); color: var(--secondary); }
    .icon-emerald { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); }
    .icon-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    /* Setting Rows */
    .setting-rows { display: flex; flex-direction: column; gap: 16px; }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      gap: 16px;
      transition: border-color var(--transition-fast);
    }
    .setting-row:hover { border-color: var(--glass-border-hover); }

    .setting-info { display: flex; flex-direction: column; gap: 3px; }
    .setting-name { font-size: 0.88rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .setting-desc { font-size: 0.76rem; color: var(--text-muted); }

    /* Theme Toggle Group */
    .theme-toggle-group { display: flex; gap: 6px; }
    .theme-opt {
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border);
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);
    }
    .theme-opt.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .theme-opt:not(.active):hover {
      border-color: var(--glass-border-hover);
      color: var(--text-main);
    }

    /* Toggle Switch */
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; inset: 0;
      background: var(--bg-tertiary);
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      left: 3px; top: 50%;
      transform: translateY(-50%);
      width: 16px; height: 16px;
      background: var(--text-dim);
      border-radius: 50%;
      transition: transform var(--transition-fast), background var(--transition-fast);
    }
    .toggle-switch input:checked + .toggle-slider { background: var(--primary); border-color: var(--primary); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translate(20px, -50%); background: #fff; }

    /* Account Info */
    .account-info-list { display: flex; flex-direction: column; gap: 12px; }
    .info-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }
    .info-icon { color: var(--text-dim); font-size: 0.9rem; width: 18px; text-align: center; flex-shrink: 0; }
    .info-label { display: block; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .info-val { display: block; font-size: 0.88rem; font-weight: 600; }
    .not-logged .info-val { color: var(--text-muted); font-weight: 400; }

    /* Contact Preferences */
    .contact-pref-list { display: flex; flex-direction: column; gap: 10px; }
    .pref-radio {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: var(--bg-card);
      border: 1.5px solid var(--glass-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .pref-radio input { display: none; }
    .pref-radio.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.08); }
    .pref-radio:hover:not(.selected) { border-color: var(--glass-border-hover); }
    .pref-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.05rem; flex-shrink: 0;
    }
    .pref-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .pref-name { font-size: 0.88rem; font-weight: 700; }
    .pref-desc { font-size: 0.74rem; color: var(--text-muted); }
    .pref-check { color: var(--primary); font-size: 0.9rem; opacity: 0; transition: opacity var(--transition-fast); }
    .pref-radio.selected .pref-check { opacity: 1; }

    /* Save Button */
    .btn-save {
      width: 100%;
      justify-content: center;
      padding: 12px;
      margin-top: 4px;
      transition: all var(--transition-fast);
    }
  `]
})
export class SettingsComponent {
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);

  user = this.authService.currentUser;

  // Appearance
  animationsEnabled = true;

  // Notifications
  whatsappNotif = true;
  emailNotif = true;
  campaignNotif = false;

  // Contact preference
  contactPref = 'whatsapp';

  // Save feedback
  saved = false;

  setTheme(theme: 'dark' | 'light'): void {
    this.themeService.setTheme(theme);
  }

  savePreferences(): void {
    // TODO: persist to backend/localStorage
    this.saved = true;
    setTimeout(() => { this.saved = false; }, 2500);
  }
}
