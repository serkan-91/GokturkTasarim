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
      <div class="checkout-grid" *ngIf="cartService.itemCount() > 0">
        
        <!-- LEFT COLUMN: AMAZON CHECKOUT STEPS -->
        <div class="wizard-column">
          
          <!-- 📦 AMAZON STEP 1: DELIVERY ADDRESS -->
          <div class="amazon-step-card glass-card" [class.active-step]="currentStep() === 1">
            <div class="amazon-step-header" (click)="setStep(1)">
              <div class="amazon-step-num">1</div>
              <div class="amazon-step-title">
                <h3>Teslimat ve Fatura Adresi Seçin</h3>
                <span class="amazon-step-summary" *ngIf="currentStep() > 1">
                  {{ selectedAddress() ? selectedAddress()?.title + ' - ' + selectedAddress()?.address : form.fullName + ', ' + form.address }}
                </span>
              </div>
              <button class="amazon-change-btn" *ngIf="currentStep() > 1">Değiştir</button>
            </div>

            <div *ngIf="currentStep() === 1" class="amazon-step-body animate-fadeIn">
              <!-- Logged-in Saved Address Cards (Amazon Style) -->
              <div *ngIf="authService.isLoggedIn()" class="amazon-saved-addresses">
                <h4 class="amazon-subhead"><i class="fa-solid fa-bookmark text-amber"></i> Kayıtlı Adresleriniz</h4>
                <div class="amazon-address-grid">
                  <div
                    *ngFor="let addr of savedAddresses"
                    class="amazon-address-card"
                    [class.selected]="selectedAddressId === addr.id"
                    (click)="selectAmazonAddress(addr)"
                  >
                    <div class="card-radio-head">
                      <input type="radio" name="amazonAddr" [checked]="selectedAddressId === addr.id" />
                      <strong>{{ addr.title }}</strong>
                    </div>
                    <p class="addr-person"><strong>{{ addr.name }}</strong> ({{ addr.phone }})</p>
                    <p class="addr-text">{{ addr.address }}</p>
                    <button class="btn btn-amazon-gold btn-sm use-addr-btn">Bu Adresi Kullan</button>
                  </div>

                  <!-- New Address Toggle Card -->
                  <div class="amazon-address-card new-addr-card" [class.selected]="selectedAddressId === 'new'" (click)="selectAmazonAddress('new')">
                    <div class="card-radio-head">
                      <input type="radio" name="amazonAddr" [checked]="selectedAddressId === 'new'" />
                      <strong>+ Yeni Adres Ekle</strong>
                    </div>
                    <p class="addr-text">Farklı bir teslimat adresi girmek için tıklayın.</p>
                  </div>
                </div>
              </div>

              <!-- Address Form (Shown for Guest OR when "Yeni Adres Ekle" is selected) -->
              <div *ngIf="!authService.isLoggedIn() || selectedAddressId === 'new'" class="amazon-form-block animate-fadeIn">
                <h4 class="amazon-subhead" *ngIf="authService.isLoggedIn()"><i class="fa-solid fa-pen-to-square text-cyan"></i> Yeni Adres Detayları</h4>

                <div class="checkout-form-grid">
                  <div class="field-wrap">
                    <label class="field-label">Ad Soyad *</label>
                    <input type="text" class="modern-input" placeholder="Adınız Soyadınız" [(ngModel)]="form.fullName" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Telefon Numarası *</label>
                    <input type="tel" class="modern-input" placeholder="05XX XXX XX XX" [(ngModel)]="form.phone" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">E-Posta Adresi *</label>
                    <input type="email" class="modern-input" placeholder="ornek@domain.com" [(ngModel)]="form.email" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">T.C. Kimlik / Vergi No</label>
                    <input type="text" class="modern-input" placeholder="11 haneli TKN veya 10 haneli VKN" [(ngModel)]="form.taxNumber" />
                  </div>

                  <div class="field-wrap span-2">
                    <label class="field-label">Şirket / Fatura Unvanı (Kurumsal ise)</label>
                    <input type="text" class="modern-input" placeholder="Göktürk Tasarım Reklam Ltd. Şti." [(ngModel)]="form.companyName" />
                  </div>

                  <div class="field-wrap span-2">
                    <label class="field-label">Teslimat Adresi (Kargo / Kurye) *</label>
                    <textarea class="modern-input modern-textarea" rows="2" placeholder="Kargo/Kurye açık adresi..." [(ngModel)]="form.address"></textarea>
                  </div>
                </div>
              </div>

              <!-- Fatura Adresi Seçeneği (Amazon Billing Choice) -->
              <div class="amazon-billing-toggle">
                <label class="checkbox-toggle-label">
                  <input type="checkbox" [(ngModel)]="form.sameAsDeliveryAddress" class="custom-checkbox" />
                  <span>Fatura adresim teslimat adresimle aynı</span>
                </label>

                <!-- Tam Teşekküllü Ayrı Fatura Bilgileri Paneli -->
                <div *ngIf="!form.sameAsDeliveryAddress" class="separate-billing-box glass-card animate-fadeIn">
                  <h4 class="amazon-subhead text-cyan"><i class="fa-solid fa-file-invoice"></i> Resmi Fatura & e-Fatura Bilgileri</h4>
                  
                  <div class="checkout-form-grid">
                    <div class="field-wrap span-2">
                      <label class="field-label">Fatura Kesilecek Şirket Unvanı / Ad Soyad *</label>
                      <input type="text" class="modern-input" placeholder="Örn: Göktürk Tasarım Reklam San. Tic. Ltd. Şti." [(ngModel)]="form.billingCompanyName" />
                    </div>

                    <div class="field-wrap">
                      <label class="field-label">Vergi Dairesi</label>
                      <input type="text" class="modern-input" placeholder="Örn: Maslak Vergi Dairesi" [(ngModel)]="form.billingTaxOffice" />
                    </div>

                    <div class="field-wrap">
                      <label class="field-label">Vergi No / T.C. Kimlik No *</label>
                      <input type="text" class="modern-input" placeholder="10 haneli VKN veya 11 haneli TKN" maxlength="11" [(ngModel)]="form.billingTaxNumber" />
                    </div>

                    <div class="field-wrap span-2">
                      <label class="field-label">Resmi Fatura Adresi *</label>
                      <textarea class="modern-input modern-textarea" rows="2" placeholder="Faturanın gönderileceği / kayıtlı resmi adres..." [(ngModel)]="form.billingAddress"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="amazon-action-bar">
                <button class="btn btn-amazon-gold btn-lg" (click)="setStep(2)" [disabled]="!form.fullName || !form.phone || !form.address">
                  Bu Adrese Gönder & Ödemeye Geç <i class="fa-solid fa-angle-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 📦 AMAZON STEP 2: PAYMENT METHOD -->
          <div class="amazon-step-card glass-card" [class.active-step]="currentStep() === 2">
            <div class="amazon-step-header" (click)="setStep(2)">
              <div class="amazon-step-num">2</div>
              <div class="amazon-step-title">
                <h3>Ödeme Yöntemi Seçin</h3>
                <span class="amazon-step-summary" *ngIf="currentStep() > 2">
                  {{ getPaymentMethodText() }}
                </span>
              </div>
              <button class="amazon-change-btn" *ngIf="currentStep() > 2">Değiştir</button>
            </div>

            <div *ngIf="currentStep() === 2" class="amazon-step-body animate-fadeIn">
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
                <button class="btn btn-amazon-gold btn-lg" (click)="setStep(3)">
                  Sipariş Onayına Geç <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 📦 AMAZON STEP 3: ORDER CONFIRMATION -->
          <div class="amazon-step-card glass-card" [class.active-step]="currentStep() === 3">
            <div class="amazon-step-header" (click)="setStep(3)">
              <div class="amazon-step-num">3</div>
              <div class="amazon-step-title">
                <h3>Sipariş İnceleme ve Onay</h3>
              </div>
            </div>

            <div *ngIf="currentStep() === 3" class="amazon-step-body animate-fadeIn">
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
                  <span class="rev-lbl">Fatura Bilgisi:</span>
                  <span>
                    {{ form.sameAsDeliveryAddress ? 'Teslimat Adresi ve Bilgileri ile Aynı' : (form.billingCompanyName || form.fullName) + ' (' + (form.billingTaxNumber || 'TKN/VKN Belirtilmedi') + ') - ' + (form.billingAddress || form.address) }}
                  </span>
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
                <button class="btn btn-amazon-gold btn-lg btn-success-gradient" (click)="submitCheckout()">
                  <i class="fa-solid fa-lock"></i> Ödemeyi Tamamla ve Siparişi Ver
                </button>
              </div>
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
      <div *ngIf="cartService.itemCount() === 0" class="glass-card empty-checkout-card">
        <i class="fa-solid fa-cart-arrow-down empty-ico"></i>
        <h3>Sepetinizde Henüz Ürün Bulunmuyor</h3>
        <p>Ödeme yapabilmek için katalogdan sipariş vermek istediğiniz ürünleri sepetinize ekleyin.</p>
        <a routerLink="/projects" class="btn btn-primary">
          <i class="fa-solid fa-layer-group"></i> Ürün Kataloğuna Git
        </a>
      </div>

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
    /* Custom Checkbox Toggle */
    .checkbox-toggle-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
      user-select: none;
      padding: 6px 0;
    }

    /* ── AMAZON CHECKOUT ACCORDION & CARDS STYLES ── */
    .amazon-step-card {
      padding: 0;
      overflow: hidden;
      border-radius: var(--radius-lg);
      transition: all 0.25s ease;
    }
    .amazon-step-card.active-step {
      border: 2px solid #f59e0b;
      box-shadow: 0 8px 24px rgba(245,158,11,0.15);
    }

    .amazon-step-header {
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      background: var(--bg-card);
      border-bottom: 1px solid var(--glass-border);
    }

    .amazon-step-num {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: #f59e0b;
      color: #000;
      font-weight: 900;
      font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .amazon-step-title { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .amazon-step-title h3 { font-size: 1.1rem; font-weight: 800; margin: 0; }
    .amazon-step-summary { font-size: 0.8rem; color: var(--text-muted); }

    .amazon-change-btn {
      background: none; border: 1px solid var(--glass-border);
      padding: 6px 14px; border-radius: var(--radius-sm);
      color: var(--primary); font-weight: 700; font-size: 0.8rem; cursor: pointer;
    }

    .amazon-step-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .amazon-subhead {
      font-size: 0.95rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;
    }

    /* Saved Address Cards Grid */
    .amazon-address-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }

    .amazon-address-card {
      padding: 16px;
      border-radius: var(--radius-md);
      border: 2px solid var(--glass-border);
      background: var(--bg-card);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .amazon-address-card:hover { border-color: rgba(245,158,11,0.5); }
    .amazon-address-card.selected {
      border-color: #f59e0b;
      background: rgba(245,158,11,0.06);
    }

    .card-radio-head { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .addr-person { font-size: 0.84rem; margin: 0; color: var(--text-main); }
    .addr-text { font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4; }

    /* Amazon Gold Button */
    .btn-amazon-gold {
      background: linear-gradient(180deg, #f7dfa5 0%, #f0c14b 100%) !important;
      border: 1.5px solid #a88734 !important;
      color: #111 !important;
      font-weight: 800 !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
    }
    .btn-amazon-gold:hover {
      background: linear-gradient(180deg, #f5d580 0%, #eab021 100%) !important;
    }

    .use-addr-btn { margin-top: 6px; width: 100%; justify-content: center; }

    .amazon-billing-toggle {
      padding-top: 14px;
      border-top: 1px solid var(--glass-border);
      display: flex; flex-direction: column; gap: 12px;
    }
    .separate-billing-box { display: flex; flex-direction: column; gap: 8px; }

    .amazon-action-bar {
      display: flex; justify-content: flex-end; padding-top: 10px;
    }
  `]
})
export class CheckoutComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);

  currentStep = signal(1);
  isCompleted = signal(false);
  refCode = Math.floor(100000 + Math.random() * 900000);

  selectedAddressId = 'saved-1';
  selectedAddress = signal<{ id: string; title: string; name: string; phone: string; address: string } | null>(null);

  savedAddresses = [
    {
      id: 'saved-1',
      title: '🏢 Şirket / Ofis Adresi (Varsayılan)',
      name: 'Serkan Yılmaz (Göktürk Tasarım)',
      phone: '0532 518 22 34',
      address: 'Göktürk Merkez Mah. İstanbul Cad. No:79 D:4 Eyüpsultan / İstanbul'
    },
    {
      id: 'saved-2',
      title: '🏠 Ev Adresi',
      name: 'Serkan Yılmaz',
      phone: '0532 518 22 34',
      address: 'Kemerburgaz Mah. Mithatpaşa Cad. No:12 D:2 Eyüpsultan / İstanbul'
    }
  ];

  form = {
    fullName: '',
    phone: '',
    email: '',
    taxNumber: '',
    companyName: '',
    address: '',
    sameAsDeliveryAddress: true,
    billingCompanyName: '',
    billingTaxOffice: '',
    billingTaxNumber: '',
    billingAddress: '',
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
      this.form.fullName = u?.fullName || 'Serkan Yılmaz';
      this.form.phone = u?.phone || '0532 518 22 34';
      this.form.email = u?.email || 'serkan@gokturktasarim.com';
      this.form.address = this.savedAddresses[0].address;
      this.form.companyName = 'Göktürk Tasarım Ltd. Şti.';
      this.form.taxNumber = '1920839412';
      this.selectedAddress.set(this.savedAddresses[0]);
    }
  }

  selectAmazonAddress(addr: any): void {
    if (typeof addr === 'string') {
      this.selectedAddressId = 'new';
      this.selectedAddress.set(null);
      this.form.address = '';
    } else {
      this.selectedAddressId = addr.id;
      this.selectedAddress.set(addr);
      this.form.fullName = addr.name;
      this.form.phone = addr.phone;
      this.form.address = addr.address;
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
