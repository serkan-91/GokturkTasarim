import { Component, inject, signal, OnInit } from '@angular/core';
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

      <div class="settings-grid">

        <!-- ── Görünüm Kartı ── -->
        <div class="glass-card settings-card">
          <div class="card-header">
            <div class="card-icon icon-purple">
              <i class="fa-solid fa-palette"></i>
            </div>
            <div>
              <h3>Görünüm</h3>
              <p class="text-muted">Tema tercihini seç</p>
            </div>
          </div>

          <div class="theme-selector">
            <button
              class="theme-card"
              [class.active]="themeService.currentTheme() === 'dark'"
              (click)="themeService.setTheme('dark')"
            >
              <div class="theme-preview dark-preview">
                <div class="preview-bar"></div>
                <div class="preview-content">
                  <div class="preview-line"></div>
                  <div class="preview-line short"></div>
                </div>
              </div>
              <div class="theme-label">
                <i class="fa-solid fa-moon"></i>
                <span>Gece</span>
                <i class="fa-solid fa-circle-check check-icon" *ngIf="themeService.currentTheme() === 'dark'"></i>
              </div>
            </button>

            <button
              class="theme-card"
              [class.active]="themeService.currentTheme() === 'light'"
              (click)="themeService.setTheme('light')"
            >
              <div class="theme-preview light-preview">
                <div class="preview-bar"></div>
                <div class="preview-content">
                  <div class="preview-line"></div>
                  <div class="preview-line short"></div>
                </div>
              </div>
              <div class="theme-label">
                <i class="fa-solid fa-sun"></i>
                <span>Gündüz</span>
                <i class="fa-solid fa-circle-check check-icon" *ngIf="themeService.currentTheme() === 'light'"></i>
              </div>
            </button>
          </div>
        </div>

        <!-- ── Bildirimler Kartı ── (her zaman görünür) -->
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
                  <i class="fa-brands fa-whatsapp" style="color:#25D366"></i> WhatsApp
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
                  <i class="fa-solid fa-envelope" style="color:var(--accent-purple)"></i> E-Posta
                </span>
                <span class="setting-desc">Sipariş onayı e-posta ile gelsin</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="emailNotif" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-name">
                  <i class="fa-solid fa-tag" style="color:var(--status-warning)"></i> Kampanyalar
                </span>
                <span class="setting-desc">İndirim ve fırsatlardan haberdar ol</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="campaignNotif" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- ── İletişim Tercihi ── (her zaman görünür) -->
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

        <!-- ── Hesap Bilgileri — SADECE GİRİŞ YAPINCA GÖRÜNÜR ── -->
        <ng-container *ngIf="authService.isLoggedIn()">
          <div class="glass-card settings-card profile-card">
            <div class="card-header">
              <div class="card-icon icon-cyan">
                <i class="fa-solid fa-circle-user"></i>
              </div>
              <div>
                <h3>Profil Bilgilerim</h3>
                <p class="text-muted">Hesap bilgileriniz</p>
              </div>
            </div>

            <!-- Profil fotoğrafı bölümü -->
            <div class="profile-avatar-section">
              <div class="profile-avatar-wrap">
                <img
                  *ngIf="authService.currentUser()?.avatarUrl || previewUrl()"
                  [src]="previewUrl() || authService.currentUser()?.avatarUrl"
                  alt="Profil Fotoğrafı"
                  class="profile-avatar-img"
                />
                <div
                  *ngIf="!authService.currentUser()?.avatarUrl && !previewUrl()"
                  class="profile-avatar-initial"
                  [ngClass]="authService.isAdmin() ? 'avatar-admin' : 'avatar-customer'"
                >
                  {{ getInitials() }}
                </div>
                <!-- Fotoğraf yükleme overlay -->
                <label class="avatar-upload-label" title="Fotoğraf Değiştir">
                  <i class="fa-solid fa-camera"></i>
                  <input type="file" accept="image/*" class="avatar-file-input" (change)="onAvatarChange($event)" />
                </label>
              </div>
              <div class="profile-name-block">
                <span class="profile-fullname">{{ authService.currentUser()?.fullName }}</span>
                <span class="badge" [ngClass]="authService.isAdmin() ? 'badge-primary' : 'badge-success'">
                  {{ authService.isAdmin() ? 'Yönetici' : 'Müşteri' }}
                </span>
                <span class="profile-upload-hint">Fotoğrafa tıklayarak değiştirebilirsin</span>
              </div>
            </div>

            <!-- Bilgi satırları -->
            <div class="account-info-list">
              <div class="info-row">
                <i class="fa-solid fa-user info-icon"></i>
                <div>
                  <span class="info-label">Ad Soyad</span>
                  <span class="info-val">{{ authService.currentUser()?.fullName || '—' }}</span>
                </div>
              </div>
              <div class="info-row">
                <i class="fa-solid fa-envelope info-icon"></i>
                <div>
                  <span class="info-label">E-Posta</span>
                  <span class="info-val">{{ authService.currentUser()?.email || '—' }}</span>
                </div>
              </div>
              <div class="info-row" *ngIf="authService.currentUser()?.phone">
                <i class="fa-solid fa-phone info-icon"></i>
                <div>
                  <span class="info-label">Telefon</span>
                  <span class="info-val">{{ authService.currentUser()?.phone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Fatura & Adres Bilgileri Kartı ── -->
          <div class="glass-card settings-card profile-card">
            <div class="card-header">
              <div class="card-icon icon-amber">
                <i class="fa-solid fa-file-invoice"></i>
              </div>
              <div>
                <h3>Fatura & Teslimat Adreslerim</h3>
                <p class="text-muted">Fatura için T.C. / Vergi No ve teslimat adreslerinizi düzenleyin</p>
              </div>
            </div>

            <form (ngSubmit)="saveBillingDetails()" class="billing-form-wrapper">
              <!-- Müşteri Tipi Segmented Tab Switch -->
              <div class="segmented-control">
                <button
                  type="button"
                  class="segmented-tab"
                  [class.active]="billingForm.customerType === 'Individual'"
                  (click)="billingForm.customerType = 'Individual'"
                >
                  <i class="fa-solid fa-user-tie"></i>
                  <span>Bireysel Müşteri (T.C. Kimlik)</span>
                </button>
                <button
                  type="button"
                  class="segmented-tab"
                  [class.active]="billingForm.customerType === 'Corporate'"
                  (click)="billingForm.customerType = 'Corporate'"
                >
                  <i class="fa-solid fa-building"></i>
                  <span>Kurumsal Şirket (Vergi Dairesi & VKN)</span>
                </button>
              </div>

              <!-- Form Alanları Grid -->
              <div class="modern-form-grid">
                <!-- Bireysel: TKN -->
                <div class="field-group" *ngIf="billingForm.customerType === 'Individual'">
                  <label class="field-label"><i class="fa-solid fa-id-card text-purple"></i> T.C. Kimlik Numarası</label>
                  <div class="input-icon-wrap">
                    <i class="fa-solid fa-fingerprint input-ico"></i>
                    <input type="text" class="modern-input" placeholder="11 Haneli T.C. Kimlik No" maxlength="11" [(ngModel)]="billingForm.taxNumber" name="taxNumberInd" />
                  </div>
                </div>

                <!-- Kurumsal: Vergi Dairesi & Vergi No -->
                <ng-container *ngIf="billingForm.customerType === 'Corporate'">
                  <div class="field-group span-2">
                    <label class="field-label"><i class="fa-solid fa-building-flag text-purple"></i> Şirket / Resmi Fatura Unvanı</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-signature input-ico"></i>
                      <input type="text" class="modern-input" placeholder="Örn: Göktürk Tasarım Reklam ve Promosyon Ltd. Şti." [(ngModel)]="billingForm.companyName" name="companyName" />
                    </div>
                  </div>

                  <div class="field-group">
                    <label class="field-label"><i class="fa-solid fa-landmark text-amber"></i> Vergi Dairesi</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-building-columns input-ico"></i>
                      <input type="text" class="modern-input" placeholder="Örn: Maslak Vergi Dairesi" [(ngModel)]="billingForm.taxOffice" name="taxOffice" />
                    </div>
                  </div>

                  <div class="field-group">
                    <label class="field-label"><i class="fa-solid fa-hashtag text-cyan"></i> Vergi Numarası (VKN)</label>
                    <div class="input-icon-wrap">
                      <i class="fa-solid fa-barcode input-ico"></i>
                      <input type="text" class="modern-input" placeholder="10 Haneli Vergi No" maxlength="10" [(ngModel)]="billingForm.taxNumber" name="taxNumberCorp" />
                    </div>
                  </div>
                </ng-container>

                <!-- Teslimat Adresi -->
                <div class="field-group span-2">
                  <label class="field-label"><i class="fa-solid fa-truck-ramp-box text-emerald"></i> Varsayılan Teslimat Adresi (Kurye / Kargo)</label>
                  <div class="input-icon-wrap textarea-wrap">
                    <i class="fa-solid fa-location-dot input-ico"></i>
                    <textarea class="modern-input modern-textarea" rows="3" placeholder="Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul" [(ngModel)]="billingForm.deliveryAddress" name="deliveryAddress"></textarea>
                  </div>
                </div>

                <!-- Fatura Adresi -->
                <div class="field-group span-2">
                  <label class="field-label"><i class="fa-solid fa-receipt text-cyan"></i> Resmi Fatura Adresi</label>
                  <div class="input-icon-wrap textarea-wrap">
                    <i class="fa-solid fa-file-contract input-ico"></i>
                    <textarea class="modern-input modern-textarea" rows="2" placeholder="Teslimat adresiyle aynı değilse fatura adresini buraya giriniz..." [(ngModel)]="billingForm.billingAddress" name="billingAddress"></textarea>
                  </div>
                </div>
              </div>

              <!-- Alt Aksiyon Barı -->
              <div class="form-actions-right">
                <button type="submit" class="btn btn-primary btn-save-modern">
                  <i class="fa-solid" [ngClass]="billingSaved ? 'fa-circle-check' : 'fa-floppy-disk'"></i>
                  {{ billingSaved ? 'Bilgiler Başarıyla Kaydedildi!' : 'Fatura & Adres Bilgilerini Kaydet' }}
                </button>
              </div>
            </form>
          </div>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .settings-page { display: flex; flex-direction: column; gap: 28px; }

    .page-header { display: flex; align-items: flex-start; gap: 16px; }
    .page-title { font-size: 1.7rem; font-weight: 800; margin: 8px 0 4px; font-family: var(--font-heading); }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }

    /* ── Card ── */
    .settings-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);
    }
    .card-header h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 3px; }
    .card-header p { margin: 0; font-size: 0.8rem; }

    .card-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.15rem; flex-shrink: 0;
    }
    .icon-purple { background: rgba(168,85,247,0.15); color: var(--accent-purple); }
    .icon-cyan   { background: rgba(6,182,212,0.15);  color: var(--secondary); }
    .icon-emerald{ background: rgba(16,185,129,0.15); color: var(--accent-emerald); }
    .icon-amber  { background: rgba(245,158,11,0.15); color: #f59e0b; }

    /* ── Tema Seçici ── */
    .theme-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .theme-card {
      background: var(--bg-card);
      border: 2px solid var(--glass-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      overflow: hidden;
      transition: all var(--transition-fast);
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .theme-card:hover { border-color: var(--glass-border-hover); transform: translateY(-2px); }
    .theme-card.active { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

    /* Mini tema önizleme */
    .theme-preview {
      height: 80px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
    }
    .dark-preview { background: #0b0f19; }
    .light-preview { background: #f1f5f9; }

    .dark-preview .preview-bar {
      height: 8px; border-radius: 4px;
      background: rgba(99,102,241,0.6);
    }
    .light-preview .preview-bar {
      height: 8px; border-radius: 4px;
      background: rgba(79,70,229,0.6);
    }

    .preview-content { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }

    .dark-preview .preview-line {
      height: 6px; border-radius: 3px;
      background: rgba(255,255,255,0.15);
    }
    .light-preview .preview-line {
      height: 6px; border-radius: 3px;
      background: rgba(15,23,42,0.2);
    }
    .preview-line.short { width: 60%; }

    .theme-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      font-size: 0.86rem;
      font-weight: 700;
      border-top: 1px solid var(--glass-border);
    }
    .check-icon { margin-left: auto; color: var(--primary); font-size: 0.9rem; }

    /* ── Toggle Switch ── */
    .setting-rows { display: flex; flex-direction: column; gap: 12px; }

    .setting-row {
      display: flex; align-items: center; justify-content: space-between;
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
    .setting-desc { font-size: 0.74rem; color: var(--text-muted); }

    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; inset: 0;
      background: var(--bg-tertiary);
      border: 1px solid var(--glass-border);
      border-radius: 9999px; cursor: pointer;
      transition: all var(--transition-fast);
    }
    .toggle-slider::before {
      content: ''; position: absolute;
      left: 3px; top: 50%; transform: translateY(-50%);
      width: 16px; height: 16px;
      background: var(--text-dim); border-radius: 50%;
      transition: transform var(--transition-fast), background var(--transition-fast);
    }
    .toggle-switch input:checked + .toggle-slider { background: var(--primary); border-color: var(--primary); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translate(20px, -50%); background: #fff; }

    /* ── Contact Preferences ── */
    .contact-pref-list { display: flex; flex-direction: column; gap: 10px; }
    .pref-radio {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: var(--bg-card);
      border: 1.5px solid var(--glass-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .pref-radio input { display: none; }
    .pref-radio.selected { border-color: var(--primary); background: rgba(99,102,241,0.08); }
    .pref-radio:hover:not(.selected) { border-color: var(--glass-border-hover); }
    .pref-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0; }
    .pref-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .pref-name { font-size: 0.88rem; font-weight: 700; }
    .pref-desc { font-size: 0.74rem; color: var(--text-muted); }
    .pref-check { color: var(--primary); font-size: 0.9rem; opacity: 0; transition: opacity var(--transition-fast); }
    .pref-radio.selected .pref-check { opacity: 1; }

    .btn-save { width: 100%; justify-content: center; padding: 12px; margin-top: 4px; }

    /* ── Profil Kartı ── */
    .profile-card { grid-column: 1 / -1; }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 20px;
      background: rgba(99,102,241,0.05);
      border: 1px solid rgba(99,102,241,0.15);
      border-radius: var(--radius-lg);
    }

    .profile-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .profile-avatar-img {
      width: 90px; height: 90px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--primary);
      box-shadow: 0 0 0 5px var(--primary-glow);
      display: block;
    }

    .profile-avatar-initial {
      width: 90px; height: 90px;
      border-radius: 50%;
      color: #fff;
      font-weight: 900;
      font-size: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid transparent;
    }

    .avatar-admin {
      background: linear-gradient(135deg, var(--accent-purple), var(--primary));
      box-shadow: 0 0 0 5px var(--primary-glow);
    }
    .avatar-customer {
      background: linear-gradient(135deg, var(--secondary), var(--accent-emerald));
      box-shadow: 0 0 0 5px var(--secondary-glow);
    }

    /* Kamera overlay */
    .avatar-upload-label {
      position: absolute;
      bottom: 0; right: 0;
      width: 30px; height: 30px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem;
      cursor: pointer;
      border: 2px solid var(--bg-secondary);
      transition: transform var(--transition-fast), background var(--transition-fast);
    }
    .avatar-upload-label:hover { background: var(--primary-hover); transform: scale(1.1); }
    .avatar-file-input { display: none; }

    .profile-name-block {
      display: flex; flex-direction: column; gap: 6px;
    }
    .profile-fullname { font-size: 1.2rem; font-weight: 800; font-family: var(--font-heading); }
    .profile-upload-hint { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

    /* Info rows */
    .account-info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-row {
      display: flex; align-items: center; gap: 14px;
      padding: 11px 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }
    .info-icon { color: var(--text-dim); font-size: 0.88rem; width: 18px; text-align: center; flex-shrink: 0; }
    .info-label { display: block; font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .info-val { display: block; font-size: 0.9rem; font-weight: 600; }
    /* ── ULTRA MODERN FATURA & ADRES FORM STİLLERİ ── */
    .billing-form-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Segmented Control Switch */
    .segmented-control {
      display: flex;
      padding: 4px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      gap: 6px;
    }

    .segmented-tab {
      flex: 1;
      padding: 12px 18px;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: none;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.25s ease;
    }
    .segmented-tab:hover:not(.active) {
      color: var(--text-main);
      background: rgba(255,255,255,0.03);
    }
    .segmented-tab.active {
      background: var(--bg-secondary);
      color: var(--primary);
      border-color: var(--glass-border-hover);
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }

    /* Form Grid */
    .modern-form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    @media (max-width: 768px) {
      .modern-form-grid { grid-template-columns: 1fr; }
      .field-group.span-2 { grid-column: span 1; }
      .segmented-control { flex-direction: column; }
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field-group.span-2 { grid-column: span 2; }

    .field-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Icon Input Wrapper */
    .input-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-ico {
      position: absolute;
      left: 14px;
      color: var(--text-dim);
      font-size: 0.95rem;
      pointer-events: none;
    }

    .textarea-wrap .input-ico {
      top: 14px;
    }

    .modern-input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      background: var(--bg-card);
      border: 1.5px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.92rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .modern-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
      background: var(--bg-secondary);
    }

    .modern-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    /* Form Actions Bar */
    .form-actions-right {
      display: flex;
      justify-content: flex-end;
      padding-top: 10px;
      border-top: 1px solid var(--glass-border);
    }

    .btn-save-modern {
      padding: 12px 28px;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: var(--radius-md);
    }
  `]
})
export class SettingsComponent implements OnInit {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);

  // Notifications
  whatsappNotif = true;
  emailNotif = true;
  campaignNotif = false;

  // Contact preference
  contactPref = 'whatsapp';

  // Save feedback
  saved = false;
  billingSaved = false;

  // Profile picture preview
  previewUrl = signal<string | null>(null);

  // Billing & Address Form State
  billingForm = {
    customerType: 'Corporate' as 'Individual' | 'Corporate',
    taxNumber: '1920839412',
    taxOffice: 'Maslak Vergi Dairesi',
    companyName: 'Göktürk Tasarım & Reklam Hizmetleri Ltd. Şti.',
    deliveryAddress: 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul',
    billingAddress: 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul'
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      if (user.company) this.billingForm.companyName = user.company;
      if (user.taxDept) this.billingForm.taxOffice = user.taxDept;
      if (user.taxNo) this.billingForm.taxNumber = user.taxNo;
      if (user.address) {
        this.billingForm.billingAddress = user.address;
        this.billingForm.deliveryAddress = user.address;
      }
    }
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  savePreferences(): void {
    this.saved = true;
    setTimeout(() => { this.saved = false; }, 2500);
  }

  saveBillingDetails(): void {
    this.authService.updateUserProfile({
      company: this.billingForm.companyName,
      taxDept: this.billingForm.taxOffice,
      taxNo: this.billingForm.taxNumber,
      address: this.billingForm.billingAddress || this.billingForm.deliveryAddress
    });
    this.billingSaved = true;
    setTimeout(() => { this.billingSaved = false; }, 2500);
  }
}
