import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-page">
      <!-- Breadcrumb & Header -->
      <div class="checkout-header glass-card">
        <div class="header-left">
          <a routerLink="/projects" class="back-link">
            <i class="fa-solid fa-arrow-left"></i> Kataloğa Dön
          </a>
          <h2><i class="fa-solid fa-shield-halved text-primary"></i> Güvenli Ödeme & Sipariş Tamamlama</h2>
        </div>
        <div class="ssl-badge">
          <i class="fa-solid fa-lock text-emerald"></i> 256-Bit SSL Güvenli Alışveriş
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="checkout-grid" *ngIf="cartService.itemCount() > 0; else emptyCart">
        
        <!-- LEFT COLUMN: 3-STEP CHECKOUT WIZARD FORM -->
        <div class="wizard-column">
          
          <!-- Stepper Tabs -->
          <div class="stepper-bar glass-card">
            <div class="step-pill" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1" (click)="setStep(1)">
              <span class="step-num">1</span>
              <span>Teslimat & Fatura</span>
            </div>
            <div class="step-divider"></div>
            <div class="step-pill" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2" (click)="currentStep() > 1 ? setStep(2) : null">
              <span class="step-num">2</span>
              <span>Ödeme Yöntemi</span>
            </div>
            <div class="step-divider"></div>
            <div class="step-pill" [class.active]="currentStep() === 3" (click)="currentStep() > 2 ? setStep(3) : null">
              <span class="step-num">3</span>
              <span>Sipariş Onayı</span>
            </div>
          </div>

          <!-- STEP 1: ADRES & TESLİMAT BİLGİLERİ -->
          <div *ngIf="currentStep() === 1" class="glass-card step-card animate-fadeIn">
            <div class="card-head">
              <h3><i class="fa-solid fa-truck-ramp-box text-cyan"></i> 1. Teslimat & Fatura Adresi</h3>
              <p class="text-muted">Siparişinizin gönderileceği adres ve fatura detaylarını giriniz.</p>
            </div>

            <!-- Auto-fill notice -->
            <div class="alert-notice notice-success" *ngIf="authService.isLoggedIn()">
              <i class="fa-solid fa-circle-check"></i>
              <span>Profilinizdeki kayıtlı bilgileriniz <strong>otomatik dolduruldu</strong>.</span>
            </div>
            <div class="alert-notice notice-warn" *ngIf="!authService.isLoggedIn()">
              <i class="fa-solid fa-user-clock"></i>
              <span>Ziyaretçi olarak sipariş veriyorsunuz. İsterseniz <a routerLink="/login">Giriş Yaparak</a> adreslerinizi kaydedebilirsiniz.</span>
            </div>

            <!-- Form Grid -->
            <div class="checkout-form-grid">
              <div class="field-wrap">
                <label class="field-label">Ad Soyad *</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-user input-ico"></i>
                  <input type="text" class="modern-input" placeholder="Adınız Soyadınız" [(ngModel)]="form.fullName" />
                </div>
              </div>

              <div class="field-wrap">
                <label class="field-label">Telefon Numarası *</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-phone input-ico"></i>
                  <input type="tel" class="modern-input" placeholder="05XX XXX XX XX" [(ngModel)]="form.phone" />
                </div>
              </div>

              <div class="field-wrap">
                <label class="field-label">E-Posta Adresi *</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-envelope input-ico"></i>
                  <input type="email" class="modern-input" placeholder="ornek@domain.com" [(ngModel)]="form.email" />
                </div>
              </div>

              <div class="field-wrap">
                <label class="field-label">T.C. Kimlik / Vergi No</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-id-card input-ico"></i>
                  <input type="text" class="modern-input" placeholder="11 haneli TKN veya 10 haneli VKN" [(ngModel)]="form.taxNumber" />
                </div>
              </div>

              <div class="field-wrap span-2">
                <label class="field-label">Şirket / Fatura Unvanı (Kurumsal ise)</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-building input-ico"></i>
                  <input type="text" class="modern-input" placeholder="Göktürk Tasarım Reklam Ltd. Şti." [(ngModel)]="form.companyName" />
                </div>
              </div>

              <div class="field-wrap span-2">
                <label class="field-label">Teslimat Adresi *</label>
                <div class="input-wrap textarea-wrap">
                  <i class="fa-solid fa-location-dot input-ico"></i>
                  <textarea class="modern-input modern-textarea" rows="3" placeholder="Kargo/Kurye açık adresi..." [(ngModel)]="form.address"></textarea>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-primary btn-lg" (click)="setStep(2)" [disabled]="!form.fullName || !form.phone || !form.address">
                Ödeme Yöntemine Geç <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- STEP 2: ÖDEME YÖNTEMİ SEÇİMİ -->
          <div *ngIf="currentStep() === 2" class="glass-card step-card animate-fadeIn">
            <div class="card-head">
              <h3><i class="fa-solid fa-credit-card text-emerald"></i> 2. Ödeme Yöntemi Seçiniz</h3>
              <p class="text-muted">Size uygun güvenli ödeme yöntemini belirleyin.</p>
            </div>

            <div class="payment-options-list">
              <!-- Option 1: Credit Card -->
              <div class="payment-box" [class.selected]="form.paymentMethod === 'CreditCard'" (click)="form.paymentMethod = 'CreditCard'">
                <div class="pay-radio">
                  <input type="radio" name="payOpt" value="CreditCard" [checked]="form.paymentMethod === 'CreditCard'" />
                </div>
                <div class="pay-info">
                  <div class="pay-head-row">
                    <strong class="pay-title"><i class="fa-solid fa-credit-card text-primary"></i> Kredi / Banka Kartı (PayTR Sanal POS)</strong>
                    <span class="badge badge-success">3D SECURE</span>
                  </div>
                  <p class="pay-sub">Tüm banka kartları ile 256-bit şifreli güvenli ödeme yapabilirsiniz.</p>
                </div>
              </div>

              <!-- Credit Card Form -->
              <div *ngIf="form.paymentMethod === 'CreditCard'" class="card-subform animate-fadeIn">
                <div class="checkout-form-grid">
                  <div class="field-wrap span-2">
                    <label class="field-label">Kart Üzerindeki İsim</label>
                    <input type="text" class="modern-input" placeholder="AHMET YILMAZ" [(ngModel)]="form.cardHolder" />
                  </div>
                  <div class="field-wrap span-2">
                    <label class="field-label">Kart Numarası</label>
                    <input type="text" class="modern-input" placeholder="4543 **** **** 1234" maxlength="19" [(ngModel)]="form.cardNumber" />
                  </div>
                  <div class="field-wrap">
                    <label class="field-label">Son Kullanma Tarihi</label>
                    <input type="text" class="modern-input" placeholder="AA / YY" maxlength="5" [(ngModel)]="form.cardExpiry" />
                  </div>
                  <div class="field-wrap">
                    <label class="field-label">CVC Güvenlik Kodu</label>
                    <input type="password" class="modern-input" placeholder="***" maxlength="4" [(ngModel)]="form.cardCvc" />
                  </div>
                </div>
              </div>

              <!-- Option 2: Bank Transfer -->
              <div class="payment-box" [class.selected]="form.paymentMethod === 'BankTransfer'" (click)="form.paymentMethod = 'BankTransfer'">
                <div class="pay-radio">
                  <input type="radio" name="payOpt" value="BankTransfer" [checked]="form.paymentMethod === 'BankTransfer'" />
                </div>
                <div class="pay-info">
                  <div class="pay-head-row">
                    <strong class="pay-title"><i class="fa-solid fa-landmark text-emerald"></i> Banka Havalesi / EFT / FAST</strong>
                    <span class="badge badge-primary">%5 İSKONTO</span>
                  </div>
                  <p class="pay-sub">Kurumsal Garanti BBVA IBAN hesabımıza ödeme yapabilirsiniz.</p>
                </div>
              </div>

              <!-- Option 3: Cash on Delivery -->
              <div class="payment-box" [class.selected]="form.paymentMethod === 'CashOnDelivery'" (click)="form.paymentMethod = 'CashOnDelivery'">
                <div class="pay-radio">
                  <input type="radio" name="payOpt" value="CashOnDelivery" [checked]="form.paymentMethod === 'CashOnDelivery'" />
                </div>
                <div class="pay-info">
                  <div class="pay-head-row">
                    <strong class="pay-title"><i class="fa-solid fa-motorcycle text-amber"></i> Kapıda / Motorlu Kuryeye Ödeme</strong>
                  </div>
                  <p class="pay-sub">Teslimat anında motorlu kuryemize nakit veya POS cihazı ile ödeyin.</p>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" (click)="setStep(1)"><i class="fa-solid fa-arrow-left"></i> Adrese Dön</button>
              <button class="btn btn-primary btn-lg" (click)="setStep(3)">
                Sipariş Onayına Geç <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- STEP 3: SİPARİŞ ONAYI & TAMAMLAMA -->
          <div *ngIf="currentStep() === 3" class="glass-card step-card animate-fadeIn">
            <div class="card-head">
              <h3><i class="fa-solid fa-clipboard-check text-purple"></i> 3. Siparişi Kontrol Et ve Onayla</h3>
              <p class="text-muted">Son kontrollerinizi yaparak siparişinizi oluşturun.</p>
            </div>

            <div class="final-review-box">
              <div class="review-row">
                <span class="rev-lbl">Müşteri / Alıcı:</span>
                <strong>{{ form.fullName }} ({{ form.phone }})</strong>
              </div>
              <div class="review-row">
                <span class="rev-lbl">E-Posta:</span>
                <span>{{ form.email }}</span>
              </div>
              <div class="review-row">
                <span class="rev-lbl">Teslimat Adresi:</span>
                <span>{{ form.address }}</span>
              </div>
              <div class="review-row">
                <span class="rev-lbl">Ödeme Yöntemi:</span>
                <strong class="text-primary">{{ getPaymentMethodText() }}</strong>
              </div>
            </div>

            <div class="order-notes-wrap">
              <label class="field-label">Sipariş / Baskı Notunuz (Opsiyonel)</label>
              <textarea class="modern-input modern-textarea" rows="2" placeholder="Özel renk, kesim veya teslimat notlarınızı buraya yazabilirsiniz..." [(ngModel)]="form.notes"></textarea>
            </div>

            <div class="step-actions">
              <button class="btn btn-secondary" (click)="setStep(2)"><i class="fa-solid fa-arrow-left"></i> Ödemeyi Düzenle</button>
              <button class="btn btn-primary btn-lg btn-success-gradient" (click)="submitCheckout()">
                <i class="fa-solid fa-lock"></i> Siparişi Onayla ve Tamamla
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: STICKY ORDER SUMMARY CARD -->
        <div class="summary-column">
          <div class="glass-card summary-card sticky-card">
            <div class="card-head">
              <h3><i class="fa-solid fa-basket-shopping text-primary"></i> Sipariş Özetiniz</h3>
              <span class="item-badge">{{ cartService.itemCount() }} Ürün</span>
            </div>

            <!-- Products List -->
            <div class="summary-items">
              <div *ngFor="let item of cartService.items()" class="summary-item-row">
                <div class="sum-item-img">
                  <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name" />
                  <i *ngIf="!item.imageUrl" class="fa-solid fa-print"></i>
                </div>
                <div class="sum-item-info">
                  <span class="sum-item-name">{{ item.name }}</span>
                  <span class="sum-item-qty">{{ item.quantity }} Adet x {{ item.basePrice | number:'1.2-2' }} ₺</span>
                </div>
                <strong class="sum-item-price">{{ (item.basePrice * item.quantity) | number:'1.2-2' }} ₺</strong>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="price-breakdown">
              <div class="p-row">
                <span>Ürünler Ara Toplamı</span>
                <strong>{{ cartService.totalAmount() | number:'1.2-2' }} ₺</strong>
              </div>
              <div class="p-row">
                <span>KDV (%20)</span>
                <span>{{ (cartService.totalAmount() * 0.20) | number:'1.2-2' }} ₺</span>
              </div>
              <div class="p-row">
                <span>Kargo / Kurye Teslimat</span>
                <span class="text-success">ÜCRETSİZ</span>
              </div>
              <div class="p-divider"></div>
              <div class="p-row total-p-row">
                <span>ÖDENECEK TOPLAM</span>
                <strong class="grand-total-val">{{ (cartService.totalAmount() * 1.20) | number:'1.2-2' }} ₺</strong>
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="trust-features">
              <div class="trust-item"><i class="fa-solid fa-shield"></i> 256-Bit SSL Korumalı</div>
              <div class="trust-item"><i class="fa-solid fa-truck-fast"></i> Hızlı Üretim & Teslimat</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Empty Cart State -->
      <ng-template #emptyCart>
        <div class="glass-card empty-checkout-card">
          <i class="fa-solid fa-cart-arrow-down empty-ico"></i>
          <h3>Sepetinizde Henüz Ürün Bulunmuyor</h3>
          <p>Ödeme yapabilmek için katalogdan sipariş vermek istediğiniz ürünleri sepetinize ekleyin.</p>
          <a routerLink="/projects" class="btn btn-primary">
            <i class="fa-solid fa-layer-group"></i> Ürün Kataloğuna Git
          </a>
        </div>
      </ng-template>

      <!-- SUCCESS MODAL -->
      <div class="modal-backdrop" *ngIf="isCompleted()">
        <div class="modal-card glass-card animate-fadeIn">
          <div class="success-box">
            <div class="success-ico">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3>Siparişiniz Başarıyla Alındı!</h3>
            <p>Siparişiniz oluşturuldu. Müşteri temsilcimiz siparişinizi onaylayıp üretime alacaktır.</p>
            <div class="order-code-badge">
              <span>Sipariş Kodunuz:</span>
              <strong>GKT-ORD-{{ refCode }}</strong>
            </div>
            <button class="btn btn-primary" (click)="finishOrder()">
              <i class="fa-solid fa-house"></i> Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .checkout-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .checkout-header {
      padding: 20px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .back-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex; align-items: center; gap: 6px;
      margin-bottom: 4px;
    }
    .back-link:hover { color: var(--primary); }

    .header-left h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .ssl-badge { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 992px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }

    /* Wizard Column */
    .wizard-column { display: flex; flex-direction: column; gap: 20px; }

    .stepper-bar {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .step-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .step-pill.active { opacity: 1; color: var(--primary); }
    .step-pill.completed { opacity: 0.9; color: var(--status-success); }

    .step-num {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--bg-card); border: 2px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 800;
    }
    .step-pill.active .step-num { background: var(--primary); color: #fff; border-color: var(--primary); }
    .step-pill.completed .step-num { background: var(--status-success); color: #fff; border-color: var(--status-success); }

    .step-divider { flex: 1; height: 2px; background: var(--glass-border); margin: 0 12px; }

    .step-card { padding: 28px; display: flex; flex-direction: column; gap: 24px; }
    .card-head h3 { font-size: 1.2rem; font-weight: 800; margin: 0 0 4px 0; }
    .card-head p { margin: 0; font-size: 0.84rem; }

    .alert-notice {
      padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.85rem;
      display: flex; align-items: center; gap: 10px;
    }
    .notice-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
    .notice-warn { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }

    /* Form Grid */
    .checkout-form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;
    }
    .field-wrap { display: flex; flex-direction: column; gap: 6px; }
    .field-wrap.span-2 { grid-column: span 2; }
    .field-label { font-size: 0.82rem; font-weight: 700; color: var(--text-main); }

    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-ico { position: absolute; left: 14px; color: var(--text-dim); font-size: 0.9rem; pointer-events: none; }
    .textarea-wrap .input-ico { top: 14px; }

    .modern-input {
      width: 100%; padding: 12px 16px 12px 42px;
      background: var(--bg-card); border: 1.5px solid var(--glass-border);
      border-radius: var(--radius-md); color: var(--text-main); font-size: 0.92rem; outline: none;
      transition: all 0.2s;
    }
    .modern-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
    .modern-textarea { resize: vertical; min-height: 80px; }

    /* Payment Boxes */
    .payment-options-list { display: flex; flex-direction: column; gap: 14px; }
    .payment-box {
      padding: 16px; border-radius: var(--radius-md); border: 1.5px solid var(--glass-border);
      background: var(--bg-card); cursor: pointer; display: flex; align-items: flex-start; gap: 14px;
      transition: all 0.2s;
    }
    .payment-box.selected {
      border-color: var(--primary); background: rgba(99,102,241,0.08); box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .pay-head-row { display: flex; align-items: center; gap: 10px; }
    .pay-title { font-size: 0.95rem; }
    .pay-sub { margin: 4px 0 0 0; font-size: 0.78rem; color: var(--text-muted); }
    .card-subform { padding: 16px; background: rgba(0,0,0,0.15); border-radius: var(--radius-md); margin-top: -6px; }

    .step-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }

    /* Summary Column */
    .sticky-card { position: sticky; top: 90px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .item-badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; background: rgba(99,102,241,0.15); color: var(--primary); font-weight: 700; }

    .summary-items { display: flex; flex-direction: column; gap: 12px; max-height: 240px; overflow-y: auto; }
    .summary-item-row { display: flex; align-items: center; gap: 12px; font-size: 0.84rem; }
    .sum-item-img { width: 44px; height: 44px; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sum-item-img img { width: 100%; height: 100%; object-fit: cover; }
    .sum-item-info { flex: 1; display: flex; flex-direction: column; }
    .sum-item-name { font-weight: 700; font-size: 0.85rem; }
    .sum-item-qty { font-size: 0.74rem; color: var(--text-muted); }
    .sum-item-price { font-weight: 800; color: var(--secondary); }

    .price-breakdown { display: flex; flex-direction: column; gap: 8px; font-size: 0.86rem; color: var(--text-muted); }
    .p-row { display: flex; justify-content: space-between; }
    .p-divider { height: 1px; background: var(--glass-border); margin: 4px 0; }
    .total-p-row { font-size: 1.05rem; font-weight: 800; color: var(--text-main); }
    .grand-total-val { font-size: 1.4rem; color: var(--accent-emerald); }

    .trust-features { display: flex; flex-direction: column; gap: 6px; font-size: 0.76rem; color: var(--text-dim); border-top: 1px solid var(--glass-border); padding-top: 12px; }

    /* Empty state */
    .empty-checkout-card { padding: 48px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-ico { font-size: 3.5rem; color: var(--text-dim); }

    .success-box { padding: 36px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .success-ico { font-size: 4rem; color: var(--status-success); }
    .order-code-badge { padding: 12px 20px; background: rgba(16,185,129,0.1); border-radius: var(--radius-md); font-size: 1rem; }
  `]
})
export class CheckoutComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);

  currentStep = signal(1);
  isCompleted = signal(false);
  refCode = Math.floor(100000 + Math.random() * 900000);

  form = {
    fullName: '',
    phone: '',
    email: '',
    taxNumber: '',
    companyName: '',
    address: '',
    paymentMethod: 'CreditCard' as 'CreditCard' | 'BankTransfer' | 'CashOnDelivery',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    notes: ''
  };

  constructor() {
    if (this.authService.isLoggedIn()) {
      const u = this.authService.currentUser();
      this.form.fullName = u?.fullName || '';
      this.form.phone = u?.phone || '';
      this.form.email = u?.email || '';
      this.form.address = 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul';
      this.form.companyName = 'Göktürk Tasarım Ltd. Şti.';
      this.form.taxNumber = '1920839412';
    }
  }

  setStep(step: number): void {
    this.currentStep.set(step);
  }

  getPaymentMethodText(): string {
    switch (this.form.paymentMethod) {
      case 'CreditCard': return 'Kredi / Banka Kartı (PayTR Sanal POS)';
      case 'BankTransfer': return 'Banka Havalesi / EFT / FAST';
      case 'CashOnDelivery': return 'Kapıda / Motorlu Kuryeye Ödeme';
      default: return 'Ödeme Yöntemi';
    }
  }

  submitCheckout(): void {
    this.cartService.clearCart();
    this.isCompleted.set(true);
  }

  finishOrder(): void {
    this.isCompleted.set(false);
    this.router.navigate(['/']);
  }
}
