import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { CustomerOrderDto, OrderItemDto } from '../../core/models/api-response.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
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

      <!-- Admin Restriction Card -->
      <div class="glass-card admin-restriction-card" *ngIf="authService.isAdmin()">
        <div class="admin-rest-icon">
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <h3>Yönetici Hesabı İle Sipariş Verilemez</h3>
        <p>Sistem yöneticisi rolü ile alışveriş yapılamaz veya sipariş oluşturulamaz. Müşteri siparişlerini incelemek ve yönetmek için lütfen Yetkili Admin Paneli'ni kullanın.</p>
        <a routerLink="/admin" class="btn btn-primary btn-lg">
          <i class="fa-solid fa-gauge-high"></i> Admin Paneline Dön
        </a>
      </div>

      <!-- Main Layout Grid -->
      <div class="checkout-grid" *ngIf="cartService.itemCount() > 0 && !authService.isAdmin()">
        
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
                    <label class="field-label"><i class="fa-solid fa-user text-purple"></i> Ad Soyad *</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-user input-ico"></i>
                      <input type="text" class="modern-input" placeholder="Adınız Soyadınız" [(ngModel)]="form.fullName" />
                    </div>
                  </div>

                  <div class="field-wrap">
                    <label class="field-label"><i class="fa-solid fa-phone text-purple"></i> Telefon Numarası *</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-phone input-ico"></i>
                      <input type="tel" class="modern-input" placeholder="05XX XXX XX XX" [(ngModel)]="form.phone" />
                    </div>
                  </div>

                  <div class="field-wrap">
                    <label class="field-label"><i class="fa-solid fa-envelope text-cyan"></i> E-Posta Adresi *</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-envelope input-ico"></i>
                      <input type="email" class="modern-input" placeholder="ornek@domain.com" [(ngModel)]="form.email" />
                    </div>
                  </div>

                  <div class="field-wrap">
                    <label class="field-label"><i class="fa-solid fa-id-card text-cyan"></i> T.C. Kimlik / Vergi No</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-id-card input-ico"></i>
                      <input type="text" class="modern-input" placeholder="11 haneli TKN veya 10 haneli VKN" [(ngModel)]="form.taxNumber" />
                    </div>
                  </div>

                  <div class="field-wrap span-2">
                    <label class="field-label"><i class="fa-solid fa-building text-amber"></i> Şirket / Fatura Unvanı (Kurumsal ise)</label>
                    <div class="input-wrap">
                      <i class="fa-solid fa-building input-ico"></i>
                      <input type="text" class="modern-input" placeholder="Göktürk Tasarım Reklam Ltd. Şti." [(ngModel)]="form.companyName" />
                    </div>
                  </div>

                  <div class="field-wrap span-2">
                    <label class="field-label"><i class="fa-solid fa-truck-ramp-box text-emerald"></i> Teslimat Adresi (Kargo / Kurye) *</label>
                    <div class="input-wrap textarea-wrap">
                      <i class="fa-solid fa-location-dot input-ico"></i>
                      <textarea class="modern-input modern-textarea" rows="2" placeholder="Kargo/Kurye açık adresi..." [(ngModel)]="form.address"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Profilime Kaydet Onay Kutusu (Eğer giriş yapılmışsa) -->
              <div class="amazon-billing-toggle" *ngIf="authService.isLoggedIn()">
                <label class="checkbox-toggle-label">
                  <input type="checkbox" [(ngModel)]="form.saveToProfile" class="custom-checkbox" />
                  <span><i class="fa-solid fa-bookmark text-amber"></i> Bu adresi sonraki siparişlerim için profilime kaydet</span>
                </label>
              </div>

              <!-- Fatura Adresi Seçeneği (Amazon Billing Choice) -->
              <div class="amazon-billing-toggle">
                <label class="checkbox-toggle-label">
                  <input type="checkbox" [(ngModel)]="form.sameAsDeliveryAddress" class="custom-checkbox" />
                  <span>Fatura adresim teslimat adresimle aynı</span>
                </label>

                <!-- Tam Teşekküllü Ayrı Fatura Bilgileri Paneli -->
                <div *ngIf="!form.sameAsDeliveryAddress" class="separate-billing-box animate-fadeIn">
                  <h4 class="amazon-subhead text-cyan"><i class="fa-solid fa-file-invoice"></i> Resmi Fatura & e-Fatura Bilgileri</h4>
                  
                  <div class="checkout-form-grid">
                    <div class="field-wrap span-2">
                      <label class="field-label"><i class="fa-solid fa-building-flag text-purple"></i> Fatura Kesilecek Şirket Unvanı / Ad Soyad *</label>
                      <div class="input-wrap">
                        <i class="fa-solid fa-signature input-ico"></i>
                        <input type="text" class="modern-input" placeholder="Örn: Göktürk Tasarım Reklam San. Tic. Ltd. Şti." [(ngModel)]="form.billingCompanyName" />
                      </div>
                    </div>

                    <div class="field-wrap">
                      <label class="field-label"><i class="fa-solid fa-landmark text-amber"></i> Vergi Dairesi</label>
                      <div class="input-wrap">
                        <i class="fa-solid fa-building-columns input-ico"></i>
                        <input type="text" class="modern-input" placeholder="Örn: Maslak Vergi Dairesi" [(ngModel)]="form.billingTaxOffice" />
                      </div>
                    </div>

                    <div class="field-wrap">
                      <label class="field-label"><i class="fa-solid fa-hashtag text-cyan"></i> Vergi No / T.C. Kimlik No *</label>
                      <div class="input-wrap">
                        <i class="fa-solid fa-barcode input-ico"></i>
                        <input type="text" class="modern-input" placeholder="10 haneli VKN veya 11 haneli TKN" maxlength="11" [(ngModel)]="form.billingTaxNumber" />
                      </div>
                    </div>

                    <div class="field-wrap span-2">
                      <label class="field-label"><i class="fa-solid fa-file-contract text-emerald"></i> Resmi Fatura Adresi *</label>
                      <div class="input-wrap textarea-wrap">
                        <i class="fa-solid fa-location-dot input-ico"></i>
                        <textarea class="modern-input modern-textarea" rows="2" placeholder="Faturanın gönderileceği / kayıtlı resmi adres..." [(ngModel)]="form.billingAddress"></textarea>
                      </div>
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
                <!-- Option 1: Credit Card (PayTR) -->
                <div class="payment-box" [class.selected]="form.paymentMethod === 'CreditCard'" (click)="form.paymentMethod = 'CreditCard'">
                  <div class="pay-radio">
                    <input type="radio" name="payOpt" value="CreditCard" [checked]="form.paymentMethod === 'CreditCard'" />
                  </div>
                  <div class="pay-info">
                    <div class="pay-head-row">
                      <strong class="pay-title"><i class="fa-solid fa-credit-card text-primary"></i> Kredi / Banka Kartı (PayTR Sanal POS)</strong>
                      <span class="badge badge-success"><i class="fa-solid fa-shield-check"></i> 3D SECURE</span>
                    </div>
                    <p class="pay-sub">Tüm banka kartları (Bonus, Maximum, World, Axess, CardFinans, Paraf, Troy) ile 256-bit SSL şifreli güvenli ödeme yapabilirsiniz.</p>
                  </div>
                </div>

                <!-- Animated 3D Interactive Credit Card Preview & Form -->
                <div *ngIf="form.paymentMethod === 'CreditCard'" class="card-subform animate-fadeIn">
                  
                  <div class="interactive-card-wrapper">
                    <!-- 3D Flippable Credit Card Scene -->
                    <div class="card-3d-scene">
                      <div class="card-3d-object" [class.is-flipped]="isCardFlipped()">
                        
                        <!-- CARD FRONT -->
                        <div class="card-face card-front">
                          <div class="card-bg-gradient"></div>
                          <div class="card-pattern"></div>
                          <div class="card-glass-reflection"></div>

                          <div class="card-front-content">
                            <!-- Top: EMV Chip & Contactless & Brand Logo -->
                            <div class="card-top-row">
                              <div class="chip-and-wave">
                                <div class="emv-chip">
                                  <div class="chip-line"></div>
                                  <div class="chip-line"></div>
                                  <div class="chip-line"></div>
                                </div>
                                <i class="fa-solid fa-wifi contactless-icon"></i>
                              </div>

                              <div class="card-brand-logo">
                                <span *ngIf="getCardBrand() === 'visa'" class="brand-badge brand-visa">VISA</span>
                                <span *ngIf="getCardBrand() === 'mastercard'" class="brand-badge brand-mastercard">
                                  <span class="mc-circle mc-red"></span>
                                  <span class="mc-circle mc-yellow"></span>
                                </span>
                                <span *ngIf="getCardBrand() === 'troy'" class="brand-badge brand-troy">troy</span>
                                <span *ngIf="getCardBrand() === 'amex'" class="brand-badge brand-amex">AMEX</span>
                                <span *ngIf="getCardBrand() === 'generic'" class="brand-badge brand-generic">
                                  <i class="fa-solid fa-shield-halved text-emerald"></i> GÖKTÜRK POS
                                </span>
                              </div>
                            </div>

                            <!-- Middle: Dynamic 16-digit Card Number -->
                            <div class="card-number-display">
                              <span class="num-group" *ngFor="let group of getFormattedCardNumberGroups()">
                                {{ group }}
                              </span>
                            </div>

                            <!-- Bottom: Cardholder Name & Expiry -->
                            <div class="card-bottom-row">
                              <div class="card-holder-col">
                                <span class="card-meta-lbl">KART SAHİBİ</span>
                                <span class="card-meta-val">
                                  {{ form.cardHolder ? form.cardHolder.toUpperCase() : (form.fullName ? form.fullName.toUpperCase() : 'AD SOYAD') }}
                                </span>
                              </div>
                              <div class="card-expiry-col">
                                <span class="card-meta-lbl">VALID THRU</span>
                                <span class="card-meta-val">{{ form.cardMonth || 'AA' }}/{{ form.cardYear || 'YY' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- CARD BACK -->
                        <div class="card-face card-back">
                          <div class="card-bg-gradient back-gradient"></div>
                          <div class="magnetic-strip"></div>
                          <div class="card-back-content">
                            <div class="signature-and-cvv-row">
                              <div class="signature-strip">
                                <span class="sig-text">AUTHORIZED SIGNATURE &bull; NOT VALID UNLESS SIGNED</span>
                              </div>
                              <div class="cvv-box">
                                <span class="cvv-lbl">CVV / CVC</span>
                                <span class="cvv-val">{{ form.cardCvc || '•••' }}</span>
                              </div>
                            </div>
                            <div class="card-back-footer">
                              <p class="card-back-terms">Bu kart 256-Bit SSL şifreleme ve PayTR 3D Secure güvencesiyle korunmaktadır.</p>
                              <div class="security-logos-row">
                                <i class="fa-solid fa-shield-halved text-emerald"></i>
                                <span>3D SECURE &bull; PCI-DSS COMPLIANT</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <!-- Interactive Inputs Connected Live to the Card -->
                    <div class="card-inputs-block">
                      <div class="checkout-form-grid">
                        <div class="field-wrap span-2">
                          <label class="field-label"><i class="fa-solid fa-user text-purple"></i> Kart Üzerindeki İsim *</label>
                          <div class="input-wrap">
                            <i class="fa-solid fa-user input-ico"></i>
                            <input
                              type="text"
                              class="modern-input uppercase-input"
                              placeholder="Ad Soyad"
                              [(ngModel)]="form.cardHolder"
                              (focus)="setCardFlipped(false)"
                            />
                          </div>
                        </div>

                        <div class="field-wrap span-2">
                          <label class="field-label"><i class="fa-solid fa-credit-card text-cyan"></i> Kart Numarası *</label>
                          <div class="input-wrap">
                            <i class="fa-solid fa-credit-card input-ico"></i>
                            <input
                              type="text"
                              inputmode="numeric"
                              class="modern-input card-num-input"
                              placeholder="0000 0000 0000 0000"
                              maxlength="19"
                              [ngModel]="form.cardNumber"
                              (input)="onCardNumberInput($event)"
                              (keydown)="onlyNumbers($event)"
                              (focus)="setCardFlipped(false)"
                            />
                            <div class="brand-preview-tag" *ngIf="getCardBrand() !== 'generic'">
                              <span class="badge badge-primary">{{ getCardBrand().toUpperCase() }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="field-wrap">
                          <label class="field-label"><i class="fa-solid fa-calendar text-amber"></i> Son Kullanma (Ay/Yıl) *</label>
                          <div class="expiry-dual-inputs">
                            <input
                              type="text"
                              inputmode="numeric"
                              class="modern-input text-center"
                              placeholder="AA"
                              maxlength="2"
                              [(ngModel)]="form.cardMonth"
                              (keydown)="onlyNumbers($event)"
                              (input)="onNumericInput($event, 'cardMonth')"
                              (focus)="setCardFlipped(false)"
                            />
                            <span class="expiry-slash">/</span>
                            <input
                              type="text"
                              inputmode="numeric"
                              class="modern-input text-center"
                              placeholder="YY"
                              maxlength="2"
                              [(ngModel)]="form.cardYear"
                              (keydown)="onlyNumbers($event)"
                              (input)="onNumericInput($event, 'cardYear')"
                              (focus)="setCardFlipped(false)"
                            />
                          </div>
                        </div>

                        <div class="field-wrap">
                          <label class="field-label"><i class="fa-solid fa-lock text-emerald"></i> CVC / CVV Kodu *</label>
                          <div class="input-wrap">
                            <i class="fa-solid fa-lock input-ico"></i>
                            <input
                              type="password"
                              inputmode="numeric"
                              class="modern-input text-center"
                              placeholder="***"
                              maxlength="4"
                              [(ngModel)]="form.cardCvc"
                              (keydown)="onlyNumbers($event)"
                              (input)="onNumericInput($event, 'cardCvc')"
                              (focus)="setCardFlipped(true)"
                              (blur)="setCardFlipped(false)"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="paytr-assurance-footer">
                        <i class="fa-solid fa-shield-halved text-emerald"></i>
                        <span>Kart bilgileriniz PayTR 256-Bit SSL şifreli 3D Secure güvenli pos altyapısı ile işlenir.</span>
                      </div>
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
                    <p class="pay-sub">Kurumsal Garanti BBVA / Ziraat / İş Bankası IBAN hesaplarımıza ödeme yapabilirsiniz.</p>
                  </div>
                </div>

                <!-- Bank Info Box -->
                <div *ngIf="form.paymentMethod === 'BankTransfer'" class="card-subform animate-fadeIn">
                  <div class="bank-accounts-preview">
                    <div class="bank-acc-item">
                      <div class="bank-acc-head">
                        <strong>Garanti BBVA</strong>
                        <span class="badge badge-outline">Havale / EFT / FAST</span>
                      </div>
                      <div class="iban-copy-row">
                        <code>TR62 0006 2000 0000 0090 1234 56</code>
                        <span class="acc-holder">Göktürk Reklam ve Tasarım Ltd. Şti.</span>
                      </div>
                    </div>
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
                    <p class="pay-sub">Teslimat anında motorlu kuryemize nakit veya mobil POS cihazı ile ödeyin.</p>
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

              <!-- Mesafeli Satış Sözleşmesi & Ön Bilgilendirme Onay Kutusu -->
              <div class="terms-agreement-box">
                <label class="terms-checkbox-label">
                  <input type="checkbox" [(ngModel)]="acceptTerms" class="terms-checkbox" />
                  <span class="terms-text">
                    <a routerLink="/legal" [queryParams]="{tab: 'mss'}" target="_blank" class="terms-link">Mesafeli Satış Sözleşmesi</a>'ni ve 
                    <a routerLink="/legal" [queryParams]="{tab: 'obf'}" target="_blank" class="terms-link">Ön Bilgilendirme Formu</a>'nu okudum, kabul ediyorum. <span class="req-star text-rose">*</span>
                  </span>
                </label>
              </div>

              <!-- Error Alert if any -->
              <div *ngIf="errorMessage()" class="alert-notice notice-warn animate-fadeIn">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{{ errorMessage() }}</span>
              </div>

              <div class="step-actions">
                <button class="btn btn-secondary" (click)="setStep(2)" [disabled]="isSubmitting()"><i class="fa-solid fa-arrow-left"></i> Ödemeyi Düzenle</button>
                <button class="btn btn-amazon-gold btn-lg btn-success-gradient" (click)="submitCheckout()" [disabled]="isSubmitting() || !acceptTerms">
                  <i *ngIf="!isSubmitting()" class="fa-solid fa-lock"></i>
                  <i *ngIf="isSubmitting()" class="fa-solid fa-spinner fa-spin"></i>
                  {{ isSubmitting() ? 'İşleniyor...' : (form.paymentMethod === 'CreditCard' ? 'PayTR ile Güvenli Öde' : 'Ödemeyi Tamamla ve Siparişi Ver') }}
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
              <div class="trust-item"><i class="fa-solid fa-shield"></i> PayTR 256-Bit SSL Korumalı</div>
              <div class="trust-item"><i class="fa-solid fa-truck-fast"></i> Hızlı Üretim & Teslimat</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Empty Cart State -->
      <div *ngIf="cartService.itemCount() === 0 && !authService.isAdmin() && !showPayTrModal() && !isCompleted()" class="glass-card empty-checkout-card">
        <i class="fa-solid fa-cart-arrow-down empty-ico"></i>
        <h3>Sepetinizde Henüz Ürün Bulunmuyor</h3>
        <p>Ödeme yapabilmek için katalogdan sipariş vermek istediğiniz ürünleri sepetinize ekleyin.</p>
        <a routerLink="/projects" class="btn btn-primary">
          <i class="fa-solid fa-layer-group"></i> Ürün Kataloğuna Git
        </a>
      </div>

      <!-- PAYTR 3D SECURE MODAL (KORUMALI & KAPANAMAZ GÜVENLİ ÖDEME PENCERESİ) -->
      <div class="modal-backdrop paytr-backdrop" *ngIf="showPayTrModal()">
        <div class="modal-card paytr-modal-card animate-fadeIn">
          <div class="paytr-modal-header">
            <div class="paytr-modal-title">
              <div class="paytr-logo-badge">
                <i class="fa-solid fa-shield-halved text-emerald"></i>
              </div>
              <div>
                <h4>PayTR 3D Secure Güvenli Ödeme</h4>
                <span class="paytr-order-ref">Sipariş No: {{ currentOrderNumber }} &bull; Tutar: {{ completedAmount | number:'1.2-2' }} ₺</span>
              </div>
            </div>
            <div class="paytr-security-badge-top">
              <i class="fa-solid fa-lock text-emerald"></i> <span>256-Bit SSL Korumalı</span>
            </div>
          </div>

          <div class="paytr-iframe-container" *ngIf="payTrIframeUrl">
            <iframe
              [src]="payTrIframeUrl"
              frameborder="0"
              scrolling="auto"
              class="paytr-iframe"
              id="paytriframe"
            ></iframe>
          </div>
        </div>
      </div>

      <!-- SUCCESS MODAL -->
      <div class="modal-backdrop" *ngIf="isCompleted()">
        <div class="modal-card glass-card animate-fadeIn">
          <div class="success-box">
            <div class="success-ico">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3>Siparişiniz Başarıyla Alındı!</h3>
            <p>Siparişiniz sisteme kaydedildi. Müşteri temsilcimiz siparişinizi onaylayıp üretime alacaktır.</p>
            <div class="order-code-badge">
              <span>Sipariş Numaranız:</span>
              <strong>{{ currentOrderNumber }}</strong>
            </div>

            <!-- If Bank Transfer, show transfer reminder -->
            <div *ngIf="form.paymentMethod === 'BankTransfer'" class="bank-transfer-success-info">
              <p class="text-amber"><strong><i class="fa-solid fa-landmark"></i> Havale / EFT Açıklaması:</strong></p>
              <code>Açıklamaya "{{ currentOrderNumber }}" yazmayı unutmayınız.</code>
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

    /* Admin Restriction Card */
    .admin-restriction-card {
      padding: 56px 36px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.06) 100%);
      border: 1px solid rgba(168,85,247,0.25);
    }
    .admin-rest-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(168,85,247,0.2); color: var(--accent-purple);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem;
    }
    .admin-restriction-card h3 { font-size: 1.4rem; font-weight: 800; margin: 0; }
    .admin-restriction-card p { max-width: 520px; font-size: 0.92rem; color: var(--text-muted); margin: 0; line-height: 1.5; }

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

    /* ── INTERACTIVE 3D ANIMATED CREDIT CARD ── */
    .interactive-card-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 10px 0;
    }

    .card-3d-scene {
      perspective: 1000px;
      width: 100%;
      max-width: 380px;
      height: 230px;
      margin: 0 auto;
    }

    .card-3d-object {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-3d-object.is-flipped {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.2);
      border: 1.5px solid rgba(255,255,255,0.18);
    }

    /* FRONT SIDE */
    .card-front {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #064e3b 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 22px 24px;
    }

    .card-bg-gradient {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 80% 20%, rgba(245,158,11,0.25) 0%, transparent 60%),
                  radial-gradient(circle at 20% 80%, rgba(6,182,212,0.25) 0%, transparent 60%);
      pointer-events: none;
    }

    .card-pattern {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 16px 16px;
      opacity: 0.4;
      pointer-events: none;
    }

    .card-glass-reflection {
      position: absolute;
      top: -50%; left: -50%; width: 200%; height: 200%;
      background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, transparent 55%);
      transform: rotate(25deg);
      pointer-events: none;
    }

    .card-front-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chip-and-wave {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .emv-chip {
      width: 44px;
      height: 32px;
      background: linear-gradient(135deg, #f7dfa5 0%, #f0c14b 50%, #d4af37 100%);
      border-radius: 6px;
      position: relative;
      border: 1px solid #a88734;
      overflow: hidden;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
    }
    .chip-line {
      position: absolute;
      background: rgba(0,0,0,0.25);
    }
    .chip-line:nth-child(1) { top: 33%; left: 0; right: 0; height: 1px; }
    .chip-line:nth-child(2) { top: 66%; left: 0; right: 0; height: 1px; }
    .chip-line:nth-child(3) { left: 50%; top: 0; bottom: 0; width: 1px; }

    .contactless-icon {
      font-size: 1.2rem;
      color: rgba(255,255,255,0.8);
      transform: rotate(90deg);
    }

    .card-brand-logo {
      display: flex;
      align-items: center;
    }

    .brand-badge {
      font-weight: 900;
      letter-spacing: 1px;
      font-size: 1.1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .brand-visa { font-style: italic; color: #fff; font-family: sans-serif; }
    .brand-mastercard {
      display: inline-flex;
      position: relative;
      width: 38px;
      height: 24px;
    }
    .mc-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      position: absolute;
    }
    .mc-red { background: #eb001b; left: 0; }
    .mc-yellow { background: #f79e1b; right: 0; opacity: 0.85; }

    .brand-troy {
      font-size: 1.15rem;
      font-weight: 900;
      color: #00bcd4;
      text-transform: lowercase;
      letter-spacing: 0;
    }
    .brand-amex {
      font-size: 0.95rem;
      color: #0077b6;
      background: #fff;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .brand-generic {
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.9);
    }

    .card-number-display {
      display: flex;
      justify-content: space-between;
      font-family: monospace;
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
      margin: 8px 0;
    }
    .num-group {
      min-width: 58px;
      text-align: center;
    }

    .card-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .card-holder-col, .card-expiry-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .card-meta-lbl {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.65);
      font-weight: 700;
      letter-spacing: 1px;
    }
    .card-meta-val {
      font-size: 0.88rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 1px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* BACK SIDE */
    .card-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #fff;
      padding: 0;
    }
    .back-gradient {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 20% 20%, rgba(99,102,241,0.2) 0%, transparent 60%);
    }
    .magnetic-strip {
      width: 100%;
      height: 42px;
      background: #000000;
      margin-top: 24px;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.8);
      position: relative;
      z-index: 2;
    }
    .card-back-content {
      padding: 16px 24px;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .signature-and-cvv-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .signature-strip {
      flex: 1;
      height: 36px;
      background: #ffffff;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px);
    }
    .sig-text {
      font-size: 0.58rem;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .cvv-box {
      width: 65px;
      height: 36px;
      background: #ffffff;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #cbd5e1;
    }
    .cvv-lbl {
      font-size: 0.55rem;
      color: #64748b;
      font-weight: 800;
    }
    .cvv-val {
      font-family: monospace;
      font-size: 0.92rem;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1px;
    }
    .card-back-footer {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-back-terms {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.6);
      margin: 0;
      line-height: 1.3;
    }
    .security-logos-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 800;
      color: rgba(255,255,255,0.8);
    }

    /* Input Helpers */
    .uppercase-input { text-transform: uppercase; }
    .brand-preview-tag {
      position: absolute;
      right: 12px;
    }
    .paytr-assurance-footer {
      margin-top: 14px;
      padding: 10px 14px;
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* PayTR Info Banner & Modal Styles */
    .paytr-info-banner {
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.08) 100%);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .paytr-icons-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .paytr-brand-tag {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      padding: 4px 10px;
      border-radius: 99px;
      border: 1px solid var(--glass-border);
    }
    .paytr-info-desc {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Bank Accounts Preview */
    .bank-accounts-preview {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .bank-acc-item {
      padding: 14px 16px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bank-acc-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .badge-outline {
      border: 1px solid var(--primary);
      color: var(--primary);
      background: rgba(99,102,241,0.08);
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 99px;
    }
    .iban-copy-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .iban-copy-row code {
      font-family: monospace;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--secondary);
      letter-spacing: 0.5px;
    }
    .acc-holder {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    /* PayTR Modal Specifics */
    .paytr-modal-card {
      width: 100%;
      max-width: 680px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      padding: 0;
    /* PayTR Modal Specifics */
    .paytr-backdrop {
      background: rgba(5, 10, 25, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .paytr-modal-card {
      width: 100%;
      max-width: 720px;
      height: 94vh;
      max-height: 820px;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      border-radius: 20px;
      background: #ffffff;
      border: 2px solid rgba(16,185,129,0.5);
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.2);
    }
    .paytr-modal-header {
      padding: 14px 22px;
      background: #0f172a;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      flex-shrink: 0;
    }
    .paytr-modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .paytr-logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(16,185,129,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .paytr-modal-title h4 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: #fff;
    }
    .paytr-order-ref {
      font-size: 0.78rem;
      color: #94a3b8;
    }
    .paytr-security-badge-top {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #10b981;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      padding: 4px 10px;
      border-radius: 99px;
    }
    .paytr-iframe-container {
      width: 100%;
      flex: 1;
      height: 100%;
      min-height: 660px;
      overflow-y: auto;
      background: #ffffff;
    }
    .paytr-iframe {
      width: 100%;
      height: 100%;
      min-height: 660px;
      border: none;
      display: block;
    }
      gap: 12px;
      flex-wrap: wrap;
    }
    .paytr-security-badge {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bank-transfer-success-info {
      padding: 12px 18px;
      background: rgba(245,158,11,0.1);
      border: 1px dashed rgba(245,158,11,0.3);
      border-radius: var(--radius-md);
      margin-top: 8px;
      text-align: center;
    }
    .bank-transfer-success-info p {
      margin: 0 0 4px 0;
      font-size: 0.88rem;
    }
    .bank-transfer-success-info code {
      font-family: monospace;
      font-size: 0.95rem;
      color: var(--secondary);
    }

    /* ── Terms Agreement Checkbox Box ── */
    .terms-agreement-box {
      margin: 18px 0;
      padding: 14px 18px;
      background: rgba(99, 102, 241, 0.08);
      border: 1.5px solid rgba(99, 102, 241, 0.25);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }
    .terms-agreement-box:hover {
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.45);
    }
    .terms-checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }
    .terms-checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
    }
    .terms-text {
      font-size: 0.86rem;
      color: var(--text-main);
      line-height: 1.5;
    }
    .terms-link {
      color: var(--cyan);
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s;
    }
    .terms-link:hover {
      color: #fff;
    }
  `]
})
export class CheckoutComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  currentStep = signal(1);
  isCompleted = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  isCardFlipped = signal(false);
  acceptTerms = false;

  showPayTrModal = signal(false);
  payTrIframeUrl: SafeResourceUrl | null = null;
  currentOrderNumber = '';
  completedAmount = 0;

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
    saveToProfile: true,
    billingCompanyName: '',
    billingTaxOffice: '',
    billingTaxNumber: '',
    billingAddress: '',
    paymentMethod: 'CreditCard' as 'CreditCard' | 'BankTransfer' | 'CashOnDelivery',
    cardHolder: '',
    cardNumber: '',
    cardMonth: '',
    cardYear: '',
    cardCvc: '',
    notes: ''
  };

  setCardFlipped(flipped: boolean): void {
    this.isCardFlipped.set(flipped);
  }

  getCardBrand(): 'visa' | 'mastercard' | 'troy' | 'amex' | 'generic' {
    const clean = (this.form.cardNumber || '').replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (clean.startsWith('9792')) return 'troy';
    if (/^(34|37)/.test(clean)) return 'amex';
    return 'generic';
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    this.form.cardNumber = formatted;
    input.value = formatted;
  }

  getFormattedCardNumberGroups(): string[] {
    const clean = (this.form.cardNumber || '').replace(/\s/g, '');
    const groups: string[] = [];
    for (let i = 0; i < 4; i++) {
      const chunk = clean.slice(i * 4, (i + 1) * 4);
      if (chunk) {
        groups.push(chunk.padEnd(4, '•'));
      } else {
        groups.push('••••');
      }
    }
    return groups;
  }

  onlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onNumericInput(event: Event, field: 'cardMonth' | 'cardYear' | 'cardCvc'): void {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/\D/g, '');
    input.value = cleanValue;

    if (field === 'cardMonth') {
      this.form.cardMonth = cleanValue;
    } else if (field === 'cardYear') {
      this.form.cardYear = cleanValue;
    } else if (field === 'cardCvc') {
      this.form.cardCvc = cleanValue;
    }
  }

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
    this.errorMessage.set(null);
    if (this.currentStep() === 1 && step === 2) {
      if (this.authService.isLoggedIn() && this.form.saveToProfile && this.form.address) {
        const existing = this.savedAddresses.find(a => a.address === this.form.address);
        if (!existing) {
          const newAddr = {
            id: 'saved-' + (this.savedAddresses.length + 1),
            title: '📍 ' + (this.form.companyName ? 'Kurumsal Adres' : 'Teslimat Adresi'),
            name: this.form.fullName,
            phone: this.form.phone,
            address: this.form.address
          };
          this.savedAddresses.push(newAddr);
          this.selectedAddressId = newAddr.id;
          this.selectedAddress.set(newAddr);
        }
      }
    }
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

  saveOrderToLocalStore(orderCode: string, itemsTitle: string): void {
    const cartItems = this.cartService.items();
    const orderItems: OrderItemDto[] = cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.basePrice,
      totalPrice: item.basePrice * item.quantity,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400'
    }));

    const displayTitle = cartItems.length === 0
      ? (itemsTitle || 'Özel Reklam / Baskı Siparişi')
      : cartItems.length === 1
        ? `${cartItems[0].name} (${cartItems[0].quantity} Adet)`
        : `${cartItems[0].name} (+${cartItems.length - 1} diğer ürün)`;

    const totalWithVat = this.completedAmount || (this.cartService.totalAmount() * 1.20);

    const newOrder: CustomerOrderDto = {
      id: orderCode,
      title: displayTitle,
      code: orderCode,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: this.form.paymentMethod === 'CreditCard' ? 'Ödendi (PayTR)' : 'Onay Bekliyor',
      statusClass: this.form.paymentMethod === 'CreditCard' ? 'badge-success' : 'badge-warning',
      totalAmount: totalWithVat,
      paymentMethod: this.getPaymentMethodText(),
      shippingAddress: this.form.address,
      items: orderItems
    };

    const currentOrders: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
    if (!currentOrders.some(o => o.code === orderCode)) {
      currentOrders.unshift(newOrder);
      localStorage.setItem('gokturk_orders', JSON.stringify(currentOrders));
    }
  }

  submitCheckout(): void {
    if (!this.form.fullName || !this.form.phone || !this.form.address) {
      this.errorMessage.set('Lütfen ad, telefon ve teslimat adresini eksiksiz doldurun.');
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage.set('Lütfen siparişi onaylamak için Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Koşullarını kabul ediniz.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const items = this.cartService.items();
    const itemsTitle = items.map(i => `${i.name} (${i.quantity} Adet)`).join(', ');
    const totalWithVat = this.cartService.totalAmount() * 1.20;
    this.completedAmount = totalWithVat;

    const payload = {
      customerName: this.form.fullName,
      customerPhone: this.form.phone,
      customerEmail: this.form.email,
      shippingAddress: this.form.address,
      billingAddress: this.form.sameAsDeliveryAddress ? this.form.address : (this.form.billingAddress || this.form.address),
      paymentMethod: this.form.paymentMethod === 'CreditCard' ? 'CreditCard_PayTR' : this.form.paymentMethod,
      notes: this.form.notes,
      items: items.map(item => ({
        productId: item.id.length === 36 ? item.id : '00000000-0000-0000-0000-000000000001',
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.basePrice
      }))
    };

    const apiUrl = `${environment.apiUrl}/orders`;
    this.http.post<any>(apiUrl, payload).subscribe({
      next: (res) => {
        const orderNumber = res?.orderNumber || ('GKT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + this.refCode);
        this.currentOrderNumber = orderNumber;

        // If Credit Card chosen, initialize PayTR Token
        if (this.form.paymentMethod === 'CreditCard') {
          this.initPayTrPayment(orderNumber, totalWithVat, itemsTitle);
        } else {
          // Bank transfer or cash on delivery -> finish directly
          this.saveOrderToLocalStore(orderNumber, itemsTitle);
          this.cartService.clearCart();
          this.isSubmitting.set(false);
          this.isCompleted.set(true);
        }
      },
      error: (err) => {
        // Fallback for offline/dev test
        const fallbackCode = 'GKT-ORD-' + this.refCode;
        this.currentOrderNumber = fallbackCode;

        if (this.form.paymentMethod === 'CreditCard') {
          this.initPayTrPayment(fallbackCode, totalWithVat, itemsTitle);
        } else {
          this.saveOrderToLocalStore(fallbackCode, itemsTitle);
          this.cartService.clearCart();
          this.isSubmitting.set(false);
          this.isCompleted.set(true);
        }
      }
    });
  }

  private initPayTrPayment(orderNumber: string, amount: number, itemsTitle: string): void {
    const paytrPayload = {
      orderNumber: orderNumber,
      amount: amount,
      customerName: this.form.fullName,
      customerEmail: this.form.email || 'musteri@gokturktasarim.com',
      customerPhone: this.form.phone,
      customerAddress: this.form.address,
      userId: this.authService.currentUser()?.id || null,
      basketItems: this.cartService.items().map(i => ({
        name: i.name,
        price: i.basePrice,
        quantity: i.quantity
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/sales/payments/paytr-token`, paytrPayload).subscribe({
      next: (tokenRes) => {
        this.isSubmitting.set(false);
        if (tokenRes && tokenRes.success && tokenRes.iframeUrl) {
          this.payTrIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(tokenRes.iframeUrl);
          this.showPayTrModal.set(true);
        } else {
          const reason = tokenRes?.errorMessage || 'PayTR token oluşturulamadı.';
          this.errorMessage.set(`PayTR Bilgisi: ${reason}`);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const reason = err?.error?.message || err?.message || 'PayTR servisine ulaşılamadı.';
        this.errorMessage.set(`PayTR Bağlantı Hatası: ${reason}`);
      }
    });
  }

  private showFallbackPaymentModal(orderNumber: string, itemsTitle: string): void {
    this.saveOrderToLocalStore(orderNumber, itemsTitle);
    this.cartService.clearCart();
    this.isCompleted.set(true);
  }

  closePayTrModal(): void {
    this.showPayTrModal.set(false);
  }

  completePayTrOrder(): void {
    const itemsTitle = this.cartService.items().map(i => `${i.name} (${i.quantity} Adet)`).join(', ');
    this.saveOrderToLocalStore(this.currentOrderNumber, itemsTitle);
    this.cartService.clearCart();
    this.showPayTrModal.set(false);
    this.isCompleted.set(true);
  }

  finishOrder(): void {
    this.isCompleted.set(false);
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/customer']);
    }
  }
}
