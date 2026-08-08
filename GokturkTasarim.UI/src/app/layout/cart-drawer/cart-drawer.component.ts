import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- ── YÜZEN SEPET TETİKLEYİCİ PİLL (FLOATING CART TRIGGER) ─────────────────────────── -->
    <div
      *ngIf="cartService.itemCount() > 0"
      class="floating-cart-pill animate-bounce-subtle"
      (click)="cartService.toggleDrawer()"
      title="Sipariş Sepetini Aç"
    >
      <div class="pill-badge-wrap">
        <i class="fa-solid fa-basket-shopping"></i>
        <span class="pill-badge">{{ cartService.totalQuantity() }}</span>
      </div>
      <div class="pill-info">
        <span class="pill-title">Sipariş Sepeti</span>
        <span class="pill-price">{{ cartService.totalAmount() | number:'1.2-2' }} ₺</span>
      </div>
      <i class="fa-solid fa-chevron-left pill-arrow"></i>
    </div>

    <!-- ── SEPET ÇEKMECESİ BACKDROP (OVERLAY) ─────────────────────────── -->
    <div
      class="drawer-backdrop"
      [class.active]="cartService.isOpen()"
      (click)="cartService.closeDrawer()"
    ></div>

    <!-- ── SEPET ÇEKMECESİ (DRAWER PANEL) ─────────────────────────── -->
    <div class="cart-drawer-panel" [class.open]="cartService.isOpen()">

      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="drawer-header-title">
          <i class="fa-solid fa-cart-flatbed text-primary"></i>
          <div>
            <h3>Sipariş Sepetiniz</h3>
            <span class="drawer-subtitle">{{ cartService.itemCount() }} Çeşit / {{ cartService.totalQuantity() }} Adet Ürün</span>
          </div>
        </div>

        <button class="drawer-close-btn" (click)="cartService.closeDrawer()" title="Kapat">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Drawer Body: Items List -->
      <div class="drawer-body">

        <!-- Empty Cart State -->
        <div *ngIf="cartService.itemCount() === 0" class="empty-drawer-state">
          <div class="empty-icon-circle">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h4>Sepetiniz Henüz Boş</h4>
          <p>Katalogdan sipariş vermek istediğiniz ürünlerin üzerindeki <strong>"Sipariş Ver / Ekle"</strong> butonuna tıklayarak buraya ekleyebilirsiniz.</p>
          <button class="btn btn-primary btn-sm" (click)="cartService.closeDrawer()">
            <i class="fa-solid fa-layer-group"></i> Ürünleri İncele
          </button>
        </div>

        <!-- Cart Items -->
        <div *ngIf="cartService.itemCount() > 0" class="cart-items-list">
          <div *ngFor="let item of cartService.items()" class="cart-item-card glass-card">
            <!-- Product Thumb -->
            <div class="item-thumb">
              <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name" class="item-img gt-blend-image" />
              <div *ngIf="!item.imageUrl" class="item-icon-fallback">
                <i class="fa-solid fa-print"></i>
              </div>
            </div>

            <!-- Details & Controls -->
            <div class="item-details">
              <div class="item-head">
                <span class="item-code">KOD: {{ item.productCode }}</span>
                <button class="item-remove-btn" (click)="cartService.removeItem(item.id)" title="Ürünü Çıkar">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <h4 class="item-name">{{ item.name }}</h4>

              <div class="item-price-row">
                <span class="unit-price">{{ item.basePrice | number:'1.2-2' }} ₺ <small>/ {{ item.unit }}</small></span>
                <strong class="item-subtotal">{{ (item.basePrice * item.quantity) | number:'1.2-2' }} ₺</strong>
              </div>

              <!-- Quantity Selector Controls -->
              <div class="quantity-controls">
                <button class="qty-btn" (click)="cartService.updateQuantity(item.id, -1)">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-val">{{ item.quantity }} Adet</span>
                <button class="qty-btn" (click)="cartService.updateQuantity(item.id, 1)">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Drawer Footer: Price Calculation & Checkout -->
      <div *ngIf="cartService.itemCount() > 0" class="drawer-footer">

        <!-- Hesaplama Özeti -->
        <div class="calc-summary">
          <div class="calc-row">
            <span>Ara Toplam</span>
            <strong>{{ cartService.totalAmount() | number:'1.2-2' }} ₺</strong>
          </div>
          <div class="calc-row">
            <span>KDV (%20)</span>
            <span>{{ (cartService.totalAmount() * 0.20) | number:'1.2-2' }} ₺</span>
          </div>
          <div class="calc-divider"></div>
          <div class="calc-row total-row">
            <span>GENEL TOPLAM</span>
            <strong class="total-price">{{ (cartService.totalAmount() * 1.20) | number:'1.2-2' }} ₺</strong>
          </div>
        </div>

        <!-- Checkout Actions -->
        <div class="checkout-actions">
          <button class="btn btn-primary btn-lg checkout-btn" (click)="openCheckoutWizard()">
            <i class="fa-solid fa-arrow-right"></i> Ödeme ve Adres Adımına Geç
          </button>
          <a
            [href]="getWhatsAppCartUrl()"
            target="_blank"
            class="btn-whatsapp-drawer"
          >
            <i class="fa-brands fa-whatsapp"></i> WhatsApp İle Hızlı İlet
          </a>
        </div>

      </div>

    </div>

    <!-- ── 🧙‍♂️ 3 ADIMLI AKILLI ÖDEME & SİPARİŞ SİHİRBAZI (CHECKOUT WIZARD MODAL) ─────────────────────────── -->
    <div class="modal-backdrop" *ngIf="showCheckoutWizard()" (click)="closeCheckoutWizard()">
      <div class="checkout-wizard-card glass-card animate-fadeIn" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="wizard-header">
          <div class="wizard-title-block">
            <h3><i class="fa-solid fa-shield-halved text-primary"></i> Güvenli Sipariş & Ödeme Sihirbazı</h3>
            <span class="wizard-sub">256-Bit SSL Şifreli Güvenli Ödeme Alt Yapısı</span>
          </div>
          <button class="wizard-close-btn" (click)="closeCheckoutWizard()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Wizard Stepper Header (1 -> 2 -> 3) -->
        <div class="wizard-stepper">
          <div class="step-item" [class.active]="wizardStep() === 1" [class.completed]="wizardStep() > 1">
            <div class="step-circle">1</div>
            <span class="step-label">Teslimat & Fatura</span>
          </div>
          <div class="step-line" [class.completed]="wizardStep() > 1"></div>
          <div class="step-item" [class.active]="wizardStep() === 2" [class.completed]="wizardStep() > 2">
            <div class="step-circle">2</div>
            <span class="step-label">Ödeme Yöntemi</span>
          </div>
          <div class="step-line" [class.completed]="wizardStep() > 2"></div>
          <div class="step-item" [class.active]="wizardStep() === 3">
            <div class="step-circle">3</div>
            <span class="step-label">Onay & Tamamla</span>
          </div>
        </div>

        <!-- ── ADIM 1: TESLİMAT & FATURA BİLGİLERİ ── -->
        <div *ngIf="wizardStep() === 1" class="wizard-step-content">
          <div class="auto-fill-alert" *ngIf="authService.isLoggedIn()">
            <i class="fa-solid fa-circle-check text-success"></i>
            <span>Hesap profilinizdeki kayıtlı teslimat ve fatura bilgileriniz <strong>otomatik dolduruldu</strong>.</span>
          </div>

          <div class="auto-fill-alert guest-alert" *ngIf="!authService.isLoggedIn()">
            <i class="fa-solid fa-user-clock text-amber"></i>
            <span>Ziyaretçi olarak sipariş veriyorsunuz. İsterseniz <a routerLink="/login" (click)="closeCheckoutWizard()">Giriş Yaparak</a> adresinizi otomatik yükleyebilirsiniz.</span>
          </div>

          <div class="wizard-form-grid">
            <div class="form-group">
              <label class="info-label"><i class="fa-solid fa-user"></i> Ad Soyad *</label>
              <input type="text" class="form-input" placeholder="Adınız Soyadınız" [(ngModel)]="checkoutForm.fullName" />
            </div>

            <div class="form-group">
              <label class="info-label"><i class="fa-solid fa-phone"></i> Telefon Numarası *</label>
              <input type="tel" class="form-input" placeholder="05XX XXX XX XX" [(ngModel)]="checkoutForm.phone" />
            </div>

            <div class="form-group">
              <label class="info-label"><i class="fa-solid fa-id-card"></i> T.C. / Vergi No</label>
              <input type="text" class="form-input" placeholder="11 haneli TKN veya 10 haneli VKN" [(ngModel)]="checkoutForm.taxNumber" />
            </div>

            <div class="form-group">
              <label class="info-label"><i class="fa-solid fa-building"></i> Şirket / Fatura Unvanı</label>
              <input type="text" class="form-input" placeholder="Kurumsal siparişler için şirket adı" [(ngModel)]="checkoutForm.companyName" />
            </div>

            <div class="form-group full-width">
              <label class="info-label"><i class="fa-solid fa-location-dot"></i> Teslimat Adresi *</label>
              <textarea class="form-input" rows="2" placeholder="Kargo/Kurye teslimat açık adresi..." [(ngModel)]="checkoutForm.address"></textarea>
            </div>
          </div>

          <div class="wizard-footer-actions">
            <button class="btn btn-secondary" (click)="closeCheckoutWizard()">Vazgeç</button>
            <button class="btn btn-primary" (click)="goToStep(2)" [disabled]="!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.address">
              Ödeme Adımına Geç <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- ── ADIM 2: ÖDEME YÖNTEMİ SEÇİMİ ── -->
        <div *ngIf="wizardStep() === 2" class="wizard-step-content">
          <div class="payment-methods-grid">
            <!-- Kart ile Ödeme -->
            <label class="payment-card-option" [class.selected]="checkoutForm.paymentMethod === 'CreditCard'">
              <input type="radio" name="payMethod" value="CreditCard" [(ngModel)]="checkoutForm.paymentMethod" />
              <div class="pay-option-body">
                <div class="pay-head">
                  <i class="fa-solid fa-credit-card pay-ico text-primary"></i>
                  <div>
                    <strong>Kredi / Banka Kartı (PayTR 3D Secure)</strong>
                    <span class="pay-desc">Tüm banka kartlarına peşin fiyatına taksit imkanı</span>
                  </div>
                </div>
              </div>
            </label>

            <!-- Kart Formu (Eğer Kredi Kartı Seçiliyse) -->
            <div *ngIf="checkoutForm.paymentMethod === 'CreditCard'" class="card-inputs-subform">
              <div class="form-group full-width">
                <label class="info-label">Kart Üzerindeki İsim</label>
                <input type="text" class="form-input" placeholder="AHMET YILMAZ" [(ngModel)]="checkoutForm.cardHolder" />
              </div>
              <div class="form-group full-width">
                <label class="info-label">16 Haneli Kart Numarası</label>
                <input type="text" class="form-input" placeholder="4543 **** **** 1234" maxlength="19" [(ngModel)]="checkoutForm.cardNumber" />
              </div>
              <div class="form-group">
                <label class="info-label">Son Kullanma Tarihi</label>
                <input type="text" class="form-input" placeholder="AA / YY" maxlength="5" [(ngModel)]="checkoutForm.cardExpiry" />
              </div>
              <div class="form-group">
                <label class="info-label">CVC / Güvenlik Kodu</label>
                <input type="password" class="form-input" placeholder="***" maxlength="4" [(ngModel)]="checkoutForm.cardCvc" />
              </div>
            </div>

            <!-- Banka Havalesi / EFT -->
            <label class="payment-card-option" [class.selected]="checkoutForm.paymentMethod === 'BankTransfer'">
              <input type="radio" name="payMethod" value="BankTransfer" [(ngModel)]="checkoutForm.paymentMethod" />
              <div class="pay-option-body">
                <div class="pay-head">
                  <i class="fa-solid fa-landmark pay-ico text-emerald"></i>
                  <div>
                    <strong>Banka Havalesi / EFT / FAST (%5 İskonto)</strong>
                    <span class="pay-desc">Kurumsal IBAN hesabımıza havale ile anında indirim</span>
                  </div>
                </div>
              </div>
            </label>

            <!-- Kapıda / Kuryeye Ödeme -->
            <label class="payment-card-option" [class.selected]="checkoutForm.paymentMethod === 'CashOnDelivery'">
              <input type="radio" name="payMethod" value="CashOnDelivery" [(ngModel)]="checkoutForm.paymentMethod" />
              <div class="pay-option-body">
                <div class="pay-head">
                  <i class="fa-solid fa-motorcycle pay-ico text-amber"></i>
                  <div>
                    <strong>Kapıda / Motorlu Kuryeye Ödeme</strong>
                    <span class="pay-desc">Teslimat anında nakit veya kurye POS cihazıyla ödeme</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div class="wizard-footer-actions">
            <button class="btn btn-secondary" (click)="goToStep(1)"><i class="fa-solid fa-arrow-left"></i> Geri</button>
            <button class="btn btn-primary" (click)="goToStep(3)">
              Sipariş Özetine Geç <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- ── ADIM 3: SİPARİŞ ÖZETİ & ONAY ── -->
        <div *ngIf="wizardStep() === 3" class="wizard-step-content">
          <div class="order-final-summary-card">
            <h4><i class="fa-solid fa-clipboard-list text-primary"></i> Sipariş Özeti</h4>
            
            <div class="summary-items-mini">
              <div *ngFor="let item of cartService.items()" class="sum-mini-row">
                <span>{{ item.name }} (x{{ item.quantity }})</span>
                <strong>{{ (item.basePrice * item.quantity) | number:'1.2-2' }} ₺</strong>
              </div>
            </div>

            <div class="summary-details-box">
              <div><strong>Alıcı:</strong> {{ checkoutForm.fullName }} ({{ checkoutForm.phone }})</div>
              <div><strong>Teslimat Adresi:</strong> {{ checkoutForm.address }}</div>
              <div><strong>Ödeme Yöntemi:</strong> {{ getPaymentMethodName() }}</div>
            </div>

            <div class="final-price-box">
              <span>Ödenecek Toplam Tutar (KDV Dahil):</span>
              <strong class="grand-price">{{ (cartService.totalAmount() * 1.20) | number:'1.2-2' }} ₺</strong>
            </div>
          </div>

          <div class="wizard-footer-actions">
            <button class="btn btn-secondary" (click)="goToStep(2)"><i class="fa-solid fa-arrow-left"></i> Geri</button>
            <button class="btn btn-primary btn-lg btn-success-gradient" (click)="finalizeCheckout()">
              <i class="fa-solid fa-lock"></i> Ödemeyi Tamamla ve Siparişi Ver
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── SİPARİŞ BAŞARILI MODALI (HIZLI TAMAMLAMA) ─────────────────────────── -->
    <div class="modal-backdrop" *ngIf="orderCompleted()">
      <div class="modal-card glass-card animate-fadeIn">
        <div class="order-success-box">
          <div class="success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>Siparişiniz Başarıyla Oluşturuldu!</h3>
          <p>Siparişiniz sistemimize kaydedildi. Ödeme alındıktan sonra ürünleriniz üretime alınacaktır.</p>
          <div class="success-ref">
            <span>Sipariş Takip Kodu:</span>
            <strong>GKT-ORD-{{ randomRefCode }}</strong>
          </div>
          <button class="btn btn-primary" (click)="orderCompleted.set(false)">
            <i class="fa-solid fa-check"></i> Tamam
          </button>
        </div>
      </div>
    </div>
          <div class="success-ref">
            <span>Referans Kodunuz:</span>
            <strong>GKT-ORD-{{ randomRefCode }}</strong>
          </div>
          <button class="btn btn-primary" (click)="orderCompleted.set(false)">
            <i class="fa-solid fa-check"></i> Tamam
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── FLOATING CART PILL (SAĞ ALT SÜZÜLEN SEPET) ── */
    .floating-cart-pill {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 999;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      color: #fff;
      padding: 10px 18px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      box-shadow: 0 12px 32px var(--primary-glow);
      border: 1.5px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(12px);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .floating-cart-pill:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 0 16px 40px var(--primary-glow);
    }

    .pill-badge-wrap {
      position: relative;
      font-size: 1.2rem;
    }
    .pill-badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: #ef4444;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 800;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--primary);
    }

    .pill-info { display: flex; flex-direction: column; }
    .pill-title { font-size: 0.75rem; opacity: 0.9; font-weight: 600; text-transform: uppercase; }
    .pill-price { font-size: 0.95rem; font-weight: 800; }
    .pill-arrow { font-size: 0.8rem; margin-left: 4px; opacity: 0.8; }

    /* ── BACKDROP & DRAWER ── */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .drawer-backdrop.active {
      opacity: 1;
      pointer-events: all;
    }

    .cart-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 420px;
      max-width: 100vw;
      background: var(--bg-secondary);
      backdrop-filter: var(--glass-blur);
      border-left: 1px solid var(--glass-border);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -16px 0 48px rgba(0,0,0,0.4);
    }
    .cart-drawer-panel.open {
      transform: translateX(0);
    }

    /* Header */
    .drawer-header {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--glass-border);
      background: rgba(99,102,241,0.05);
    }

    .drawer-header-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .drawer-header-title i { font-size: 1.5rem; }
    .drawer-header-title h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
    .drawer-subtitle { font-size: 0.76rem; color: var(--text-muted); }

    .drawer-close-btn {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 36px; height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition-fast);
    }
    .drawer-close-btn:hover { background: var(--bg-card-hover); color: var(--status-danger); }

    /* Body */
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* Empty state */
    .empty-drawer-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;
      color: var(--text-muted);
    }
    .empty-icon-circle {
      width: 70px; height: 70px;
      border-radius: 50%;
      background: rgba(99,102,241,0.1);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
    }

    /* Items */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .cart-item-card {
      padding: 14px;
      display: flex;
      gap: 14px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
    }

    .item-thumb {
      width: 64px; height: 64px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .item-img { width: 100%; height: 100%; object-fit: cover; }
    .item-icon-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-dim); }

    .item-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .item-head { display: flex; justify-content: space-between; align-items: center; }
    .item-code { font-size: 0.68rem; color: var(--text-dim); font-family: monospace; }
    .item-remove-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 2px; }
    .item-remove-btn:hover { color: var(--status-danger); }

    .item-name { font-size: 0.88rem; font-weight: 700; margin: 0; }
    .item-price-row { display: flex; justify-content: space-between; font-size: 0.82rem; margin-top: 2px; }
    .unit-price { color: var(--text-muted); }
    .item-subtotal { color: var(--secondary); font-weight: 800; }

    /* Quantity Controls */
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      background: var(--bg-secondary);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      width: fit-content;
      border: 1px solid var(--glass-border);
    }

    .qty-btn {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      width: 24px; height: 24px;
      border-radius: 4px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem;
    }
    .qty-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    .qty-val { font-size: 0.78rem; font-weight: 700; min-width: 60px; text-align: center; }

    /* Footer */
    .drawer-footer {
      padding: 20px;
      border-top: 1px solid var(--glass-border);
      background: var(--bg-card);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .calc-summary { display: flex; flex-direction: column; gap: 6px; }
    .calc-row { display: flex; justify-content: space-between; font-size: 0.84rem; color: var(--text-muted); }
    .calc-divider { height: 1px; background: var(--glass-border); margin: 4px 0; }
    .total-row { font-size: 1rem; color: var(--text-main); font-weight: 800; }
    .total-price { font-size: 1.2rem; color: var(--accent-emerald); }

    .checkout-actions { display: flex; flex-direction: column; gap: 10px; }
    .checkout-btn { width: 100%; justify-content: center; }

    .btn-whatsapp-drawer {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #fff; font-weight: 700; font-size: 0.88rem;
      text-decoration: none;
    }

    /* ── WIZARD MODAL STYLES ── */
    .checkout-wizard-card {
      width: 640px;
      max-width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--glass-border);
    }
    .wizard-title-block h3 { font-size: 1.15rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 10px; }
    .wizard-sub { font-size: 0.74rem; color: var(--text-dim); }
    .wizard-close-btn { background: none; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer; }

    /* Stepper */
    .wizard-stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
    }
    .step-item { display: flex; align-items: center; gap: 8px; opacity: 0.5; transition: opacity 0.2s; }
    .step-item.active { opacity: 1; }
    .step-item.completed { opacity: 0.9; }
    .step-circle {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--bg-card); border: 2px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.82rem; color: var(--text-main);
    }
    .step-item.active .step-circle { background: var(--primary); border-color: var(--primary); color: #fff; }
    .step-item.completed .step-circle { background: var(--status-success); border-color: var(--status-success); color: #fff; }
    .step-label { font-size: 0.8rem; font-weight: 700; }

    .step-line { flex: 1; height: 2px; background: var(--glass-border); margin: 0 12px; }
    .step-line.completed { background: var(--status-success); }

    /* Step Content */
    .wizard-step-content { display: flex; flex-direction: column; gap: 16px; }

    .auto-fill-alert {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.2);
      font-size: 0.82rem;
      color: var(--text-main);
      display: flex; align-items: center; gap: 10px;
    }
    .guest-alert { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2); }

    .wizard-form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    @media (max-width: 600px) { .wizard-form-grid { grid-template-columns: 1fr; } }

    /* Payment Options */
    .payment-methods-grid { display: flex; flex-direction: column; gap: 12px; }
    .payment-card-option {
      padding: 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--glass-border);
      background: var(--bg-card);
      cursor: pointer;
      display: flex; align-items: center; gap: 14px;
      transition: all 0.2s ease;
    }
    .payment-card-option.selected {
      border-color: var(--primary);
      background: rgba(99,102,241,0.08);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .pay-head { display: flex; align-items: center; gap: 12px; }
    .pay-ico { font-size: 1.4rem; width: 28px; text-align: center; }
    .pay-desc { display: block; font-size: 0.76rem; color: var(--text-muted); }

    .card-inputs-subform {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      padding: 14px; background: rgba(0,0,0,0.15); border-radius: var(--radius-md); margin-top: -4px;
    }

    .wizard-footer-actions {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 14px; border-top: 1px solid var(--glass-border);
    }

    .btn-success-gradient {
      background: linear-gradient(135deg, var(--status-success), #059669) !important;
      border: none !important;
    }

    .order-final-summary-card {
      display: flex; flex-direction: column; gap: 14px;
      padding: 16px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--glass-border);
    }
    .summary-items-mini { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; }
    .sum-mini-row { display: flex; justify-content: space-between; }
    .summary-details-box { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--text-muted); padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; }
    .final-price-box { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px dashed var(--glass-border); }
    .grand-price { font-size: 1.4rem; color: var(--accent-emerald); }
  `]
})
export class CartDrawerComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);

  showCheckoutWizard = signal(false);
  wizardStep = signal(1);
  orderCompleted = signal(false);
  randomRefCode = Math.floor(100000 + Math.random() * 900000);

  checkoutForm = {
    fullName: '',
    phone: '',
    taxNumber: '',
    companyName: '',
    address: '',
    paymentMethod: 'CreditCard' as 'CreditCard' | 'BankTransfer' | 'CashOnDelivery',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  };

  openCheckoutWizard(): void {
    // Auto fill if logged in
    if (this.authService.isLoggedIn()) {
      const u = this.authService.currentUser();
      this.checkoutForm.fullName = u?.fullName || '';
      this.checkoutForm.phone = u?.phone || '';
      this.checkoutForm.address = 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul';
      this.checkoutForm.companyName = 'Göktürk Tasarım Ltd. Şti.';
      this.checkoutForm.taxNumber = '1920839412';
    }
    this.wizardStep.set(1);
    this.showCheckoutWizard.set(true);
    this.cartService.closeDrawer();
  }

  closeCheckoutWizard(): void {
    this.showCheckoutWizard.set(false);
  }

  goToStep(step: number): void {
    this.wizardStep.set(step);
  }

  getPaymentMethodName(): string {
    switch (this.checkoutForm.paymentMethod) {
      case 'CreditCard': return 'Kredi / Banka Kartı (PayTR Sanal POS)';
      case 'BankTransfer': return 'Banka Havalesi / EFT / FAST';
      case 'CashOnDelivery': return 'Kapıda / Kuryeye Nakit veya POS Ödeme';
      default: return 'Ödeme Yöntemi';
    }
  }

  getWhatsAppCartUrl(): string {
    const itemsText = this.cartService.items().map(i => `- ${i.name} (${i.quantity} adet) = ${(i.basePrice * i.quantity)} TL`).join('%0A');
    const total = (this.cartService.totalAmount() * 1.20).toFixed(2);
    const text = `Merhaba, aşağıdaki sepet siparişini iletmek istiyorum:%0A%0A${itemsText}%0A%0AToplam Tutar: ${total} TL`;
    return `https://wa.me/905325182234?text=${text}`;
  }

  finalizeCheckout(): void {
    this.cartService.clearCart();
    this.closeCheckoutWizard();
    this.orderCompleted.set(true);
  }
}
