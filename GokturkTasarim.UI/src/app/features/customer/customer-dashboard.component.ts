import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { CustomerOrderDto, CargoMovementDto } from '../../core/models/api-response.model';

import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceModalComponent } from '../../shared/components/invoice-modal/invoice-modal.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InvoiceModalComponent],
  template: `
    <div class="cust-page">

      <!-- ── 1. Profil Banner ── -->
      <div class="profile-banner glass-card">
        <div class="banner-left">
          <div class="avatar-ring">
            <div class="avatar-body">
              <span *ngIf="!authService.currentUser()?.avatarUrl">{{ getInitials() }}</span>
              <img *ngIf="authService.currentUser()?.avatarUrl" [src]="authService.currentUser()?.avatarUrl" alt="Profil" />
            </div>
            <span class="online-badge"></span>
          </div>
          <div class="profile-info">
            <div class="profile-tag"><i class="fa-solid fa-crown"></i> MÜŞTERİ PORTALI</div>
            <h1>{{ authService.currentUser()?.fullName || 'Değerli Müşterimiz' }}</h1>
            <div class="profile-meta">
              <span *ngIf="authService.currentUser()?.email">
                <i class="fa-solid fa-envelope"></i> {{ authService.currentUser()?.email }}
              </span>
              <span *ngIf="authService.currentUser()?.phone">
                <i class="fa-solid fa-phone"></i> {{ authService.currentUser()?.phone }}
              </span>
            </div>
          </div>
        </div>
        <div class="banner-actions">
          <a routerLink="/projects" class="banner-btn primary-btn">
            <i class="fa-solid fa-plus"></i> Yeni Sipariş Ver
          </a>
          <a routerLink="/contact" class="banner-btn secondary-btn">
            <i class="fa-solid fa-headset"></i> Destek &amp; İletişim
          </a>
          <a href="https://wa.me/905325182234?text=Merhaba,%20sipari%C5%9Fim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." target="_blank" class="banner-btn whatsapp-btn">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>

      <!-- ── 2. Siparişleriniz (Sade & Şık Tam Genişlik) ── -->
      <div class="glass-card orders-card">
        <div class="section-header">
          <div class="section-title-group">
            <div class="section-icon cyan"><i class="fa-solid fa-bag-shopping"></i></div>
            <div>
              <h2>Siparişleriniz</h2>
              <p class="section-sub">Tüm sipariş geçmişiniz ve güncel durumlar</p>
            </div>
          </div>
          <button class="icon-refresh-btn" (click)="loadOrders()" title="Yenile" [class.spinning]="loading">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>

        <!-- Yükleniyor -->
        <div class="orders-body" *ngIf="loading">
          <div class="order-skel" *ngFor="let s of [1,2,3]">
            <div class="sk-icon"></div>
            <div class="sk-body">
              <div class="sk-line long"></div>
              <div class="sk-line short"></div>
            </div>
            <div class="sk-badge"></div>
          </div>
        </div>

        <!-- Boş Durum -->
        <div class="orders-body empty-body" *ngIf="!loading && activeOrders().length === 0">
          <div class="empty-wrap">
            <div class="empty-circle"><i class="fa-solid fa-bag-shopping"></i></div>
            <h3>Henüz Siparişiniz Yok</h3>
            <p>Ürün kataloğumuzu inceleyin ve ilk siparişinizi oluşturun.</p>
            <a routerLink="/projects" class="cta-btn">
              <i class="fa-solid fa-arrow-right"></i> Kataloğa Git
            </a>
          </div>
        </div>

        <!-- Sipariş Listesi (Sade Satırlar) -->
        <div class="orders-body" *ngIf="!loading && activeOrders().length > 0">
          <div class="order-row-card" *ngFor="let order of activeOrders(); let i = index" [style.animation-delay]="(i * 0.05) + 's'">
            <div class="order-row-main">
              <div class="order-num-badge">{{ i + 1 }}</div>
              <div class="order-icon-wrap"><i class="fa-solid fa-print"></i></div>
              <div class="order-info" (click)="openOrderDetailModal(order)" style="cursor:pointer">
                <div class="order-title-row">
                  <h4 class="order-title-link">{{ getOrderMainTitle(order) }}</h4>
                  <span class="badge-extra-items" *ngIf="getOrderExtraCount(order) > 0">
                    +{{ getOrderExtraCount(order) }} diğer ürün
                  </span>
                </div>
                <div class="order-meta">
                  <span class="meta-code clickable-code"><i class="fa-solid fa-hashtag"></i> {{ order.code }}</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-date"><i class="fa-solid fa-calendar-days"></i> {{ order.date }}</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-items-qty"><i class="fa-solid fa-boxes-stacked"></i> {{ getOrderTotalQuantity(order) }} Adet</span>
                  <span class="meta-sep" *ngIf="order.totalAmount">·</span>
                  <span class="meta-total-amount" *ngIf="order.totalAmount"><i class="fa-solid fa-receipt"></i> {{ order.totalAmount | number:'1.2-2' }} ₺</span>
                </div>
              </div>
              <div class="order-status-col">
                <span class="status-pill" [ngClass]="getStatusClass(order.status)">
                  <span class="sdot"></span>{{ order.status }}
                </span>
              </div>
              <div class="order-action-col">
                <button class="amazon-track-btn" (click)="openOrderDetailModal(order)">
                  <i class="fa-solid" [ngClass]="order.status === 'KARGOYA VERİLDİ' ? 'fa-truck-fast text-cyan' : 'fa-box-open'"></i>
                  <span>Sipariş Detayı</span>
                </button>
                <button *ngIf="invoiceService.hasInvoice(order.code)" class="invoice-btn" (click)="openInvoiceModal(order)" title="Otomatik E-Faturayı Görüntüle ve İndir">
                  <i class="fa-solid fa-file-invoice text-emerald"></i>
                  <span>E-Fatura İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="orders-footer" *ngIf="!loading && activeOrders().length > 0">
          <a routerLink="/projects" class="new-order-link">
            <i class="fa-solid fa-plus"></i> Yeni Sipariş Ver
          </a>
        </div>
      </div>

      <!-- ── 3. Favorilerim & İstek Listesi (Wishlist) ── -->
      <div class="glass-card wishlist-card" style="margin-top: 24px;">
        <div class="section-header">
          <div class="section-title-group">
            <div class="section-icon rose"><i class="fa-solid fa-heart"></i></div>
            <div>
              <h2>Favorilerim &amp; İstek Listesi</h2>
              <p class="section-sub">Kaydettiğiniz ürünler ve tekrar sipariş verebileceğiniz tasarımlar</p>
            </div>
          </div>
          <button class="icon-refresh-btn" (click)="loadWishlist()" title="Yenile">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>

        <div class="wishlist-body" *ngIf="wishlistItems().length === 0">
          <div class="empty-wrap">
            <div class="empty-circle text-rose"><i class="fa-solid fa-heart-crack"></i></div>
            <h3>Favorilerinizde Ürün Bulunmuyor</h3>
            <p>Ürün kataloğumuzdaki beğendiğiniz özel ürünleri ve tasarımları favorilere ekleyebilirsiniz.</p>
            <a routerLink="/projects" class="cta-btn text-rose-btn">
              <i class="fa-solid fa-store"></i> Ürün Kataloğuna Git
            </a>
          </div>
        </div>

        <div class="wishlist-grid" *ngIf="wishlistItems().length > 0">
          <div class="wishlist-item-card" *ngFor="let item of wishlistItems()">
            <div class="w-img-box">
              <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400'" [alt]="item.name" />
              <button class="w-remove-btn" (click)="removeFromWishlist(item.productId)" title="Favorilerden Çıkar">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <div class="w-details">
              <span class="w-cat">{{ item.category }}</span>
              <h4>{{ item.name }}</h4>
              <div class="w-price-row">
                <span class="w-price">{{ item.basePrice }} TL</span>
                <a routerLink="/projects" class="w-order-btn">
                  <i class="fa-solid fa-cart-shopping"></i> Sipariş Et
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 4. Fixed Amazon Style Order & Cargo Detail Modal ── -->
      <div class="modal-backdrop animate-fadeIn" *ngIf="selectedOrderModal()" (click)="closeOrderDetailModal()">
        <div class="modal-card amazon-order-modal glass-card" (click)="$event.stopPropagation()">
          <button class="modal-close-btn" (click)="closeOrderDetailModal()" title="Kapat">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Modal Header -->
          <div class="a-modal-header">
            <div class="a-header-left">
              <div class="a-badge-row">
                <span class="status-pill" [ngClass]="getStatusClass(selectedOrderModal()!.status)">
                  <span class="sdot"></span>{{ selectedOrderModal()!.status }}
                </span>
                <span class="a-order-code"><i class="fa-solid fa-hashtag"></i> {{ selectedOrderModal()!.code }}</span>
              </div>
              <h3>{{ getOrderMainTitle(selectedOrderModal()!) }}</h3>
              <p class="a-order-date"><i class="fa-solid fa-calendar-days"></i> Sipariş Tarihi: {{ selectedOrderModal()!.date }}</p>
            </div>
          </div>

          <div class="a-modal-body">

            <!-- ── A. Satın Alınan Ürünler & Ayrı Ayrı Değerlendirme Listesi ── -->
            <div class="purchased-items-section">
              <div class="pis-header">
                <div class="pis-title-group">
                  <i class="fa-solid fa-boxes-packing text-cyan"></i>
                  <div>
                    <strong>Siparişteki Ürünler ({{ getOrderItems(selectedOrderModal()!).length }} Çeşit)</strong>
                    <span class="pis-sub">Satın aldığınız her ürünü ayrı ayrı inceleyebilir ve değerlendirebilirsiniz.</span>
                  </div>
                </div>
                <span class="pis-total-badge" *ngIf="selectedOrderModal()!.totalAmount">
                  Genel Toplam: {{ selectedOrderModal()!.totalAmount | number:'1.2-2' }} ₺
                </span>
              </div>

              <div class="purchased-items-list">
                <div class="purchased-item-row" *ngFor="let item of getOrderItems(selectedOrderModal()!)">
                  <div class="p-item-thumb">
                    <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400'" [alt]="item.productName" />
                  </div>
                  <div class="p-item-info">
                    <h5 class="p-item-title">{{ item.productName }}</h5>
                    <div class="p-item-meta-row">
                      <span class="p-item-qty"><i class="fa-solid fa-cubes"></i> {{ item.quantity }} Adet</span>
                      <span class="p-item-sep" *ngIf="item.unitPrice">·</span>
                      <span class="p-item-unit" *ngIf="item.unitPrice">Birim: {{ item.unitPrice | number:'1.2-2' }} ₺</span>
                      <span class="p-item-sep" *ngIf="item.totalPrice">·</span>
                      <span class="p-item-total" *ngIf="item.totalPrice">Tutar: <strong>{{ item.totalPrice | number:'1.2-2' }} ₺</strong></span>
                    </div>
                  </div>
                  <div class="p-item-review-action">
                    <button *ngIf="!item.isReviewed" class="btn-item-review" (click)="openItemReviewModal(selectedOrderModal()!, item)">
                      <i class="fa-solid fa-star text-amber"></i>
                      <span>Değerlendir</span>
                    </button>
                    <div *ngIf="item.isReviewed" class="badge-item-reviewed">
                      <i class="fa-solid fa-circle-check text-emerald"></i>
                      <span>Değerlendirildi ({{ item.userRating || 5 }} ★)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cargo Tracking Section -->
            <div *ngIf="selectedOrderModal()!.status === 'KARGOYA VERİLDİ' || selectedOrderModal()!.trackingNumber" class="a-cargo-card">
              <div class="st-header">
                <div class="st-title-group">
                  <i class="fa-solid fa-truck-fast text-cyan"></i>
                  <div>
                    <strong>Kargo & Takip Bilgileri</strong>
                    <span class="st-sub">{{ selectedOrderModal()!.carrier || 'Kargo Firması' }} · {{ selectedOrderModal()!.shippedDate || 'Bugün' }}</span>
                  </div>
                </div>
                <span class="st-badge"><i class="fa-solid fa-circle-notch fa-spin"></i> Yolda</span>
              </div>

              <div class="st-body">
                <div class="st-code-row">
                  <span class="st-label">Kargo Firması:</span>
                  <span class="st-val"><strong>{{ selectedOrderModal()!.carrier || 'Belirtilmedi' }}</strong></span>
                </div>

                <div class="st-code-row">
                  <span class="st-label">Kargo Takip No:</span>
                  <span class="st-code">{{ selectedOrderModal()!.trackingNumber || 'Belirtilmedi' }}</span>
                  <button
                    *ngIf="selectedOrderModal()!.trackingNumber"
                    class="copy-btn"
                    (click)="copyTrackingNumber(selectedOrderModal()!.trackingNumber!)"
                    title="Takip Numarasını Kopyala"
                  >
                    <i class="fa-solid" [ngClass]="copiedCode() === selectedOrderModal()!.trackingNumber ? 'fa-check text-emerald' : 'fa-copy'"></i>
                    <span>{{ copiedCode() === selectedOrderModal()!.trackingNumber ? 'Kopyalandı!' : 'Kopyala' }}</span>
                  </button>
                </div>

                <div class="st-note" *ngIf="selectedOrderModal()!.shippingNote">
                  <i class="fa-solid fa-circle-info"></i>
                  <span><strong>Müşteri Notu:</strong> {{ selectedOrderModal()!.shippingNote }}</span>
                </div>

                <!-- Interactive Animated Cargo Progress Tracker -->
                <div class="interactive-cargo-tracker">
                  <div class="tracker-progress-track">
                    <div class="tracker-progress-fill" [style.width]="getProgressPercent(selectedOrderModal()!.status) + '%'"></div>
                    <div class="moving-truck" [style.left]="getProgressPercent(selectedOrderModal()!.status) + '%'">
                      <i class="fa-solid fa-truck-fast"></i>
                    </div>
                  </div>

                  <div class="tracker-steps">
                    <div
                      class="istep"
                      [class.istep-done]="getStepState(selectedOrderModal()!.status, 1) === 'done'"
                      [class.istep-active]="getStepState(selectedOrderModal()!.status, 1) === 'active'"
                      (click)="selectStep(selectedOrderModal()!.code, 1)"
                    >
                      <div class="istep-node">
                        <i class="fa-solid" [ngClass]="getStepState(selectedOrderModal()!.status, 1) === 'done' ? 'fa-check' : 'fa-box'"></i>
                      </div>
                      <span class="istep-label">1. Kargoya Verildi</span>
                    </div>

                    <div
                      class="istep"
                      [class.istep-done]="getStepState(selectedOrderModal()!.status, 2) === 'done'"
                      [class.istep-active]="getStepState(selectedOrderModal()!.status, 2) === 'active'"
                      (click)="selectStep(selectedOrderModal()!.code, 2)"
                    >
                      <div class="istep-node">
                        <i class="fa-solid" [ngClass]="getStepState(selectedOrderModal()!.status, 2) === 'done' ? 'fa-check' : 'fa-truck-fast'"></i>
                      </div>
                      <span class="istep-label">2. Yolda / Dağıtımda</span>
                    </div>

                    <div
                      class="istep"
                      [class.istep-done]="getStepState(selectedOrderModal()!.status, 3) === 'done'"
                      [class.istep-active]="getStepState(selectedOrderModal()!.status, 3) === 'active'"
                      (click)="selectStep(selectedOrderModal()!.code, 3)"
                    >
                      <div class="istep-node">
                        <i class="fa-solid" [ngClass]="getStepState(selectedOrderModal()!.status, 3) === 'done' ? 'fa-check' : 'fa-house-chimney'"></i>
                      </div>
                      <span class="istep-label">3. Teslim Edilecek</span>
                    </div>
                  </div>

                  <div class="step-detail-card animate-fadeIn" *ngIf="selectedStepMap()[selectedOrderModal()!.code] as step">
                    <div class="sd-icon">
                      <i class="fa-solid" [ngClass]="step === 1 ? 'fa-box text-emerald' : step === 2 ? 'fa-truck-fast text-cyan' : 'fa-house-chimney text-purple'"></i>
                    </div>
                    <div class="sd-content">
                      <strong>{{ getStepTitle(step) }}</strong>
                      <p>{{ getStepDesc(step, selectedOrderModal()!.carrier) }}</p>
                    </div>
                    <button class="sd-close" (click)="selectStep(selectedOrderModal()!.code, 0)"><i class="fa-solid fa-xmark"></i></button>
                  </div>
                </div>

                <!-- Live Cargo Movements Accordion -->
                <div class="cargo-movements-section" *ngIf="selectedOrderModal()!.trackingNumber">
                  <button class="toggle-movements-btn" (click)="toggleMovements(selectedOrderModal()!.code, selectedOrderModal()!.carrier, selectedOrderModal()!.trackingNumber)">
                    <span><i class="fa-solid fa-clock-rotate-left"></i> Detaylı Kargo Hareketleri ve Şube Geçmişi</span>
                    <i class="fa-solid" [ngClass]="isMovementsOpen(selectedOrderModal()!.code) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                  </button>

                  <div class="movements-list animate-fadeIn" *ngIf="isMovementsOpen(selectedOrderModal()!.code)">
                    <div class="movement-item" *ngFor="let m of getCargoMovements(selectedOrderModal()!.code)">
                      <div class="m-time-col">
                        <span class="m-time">{{ m.time }}</span>
                        <span class="m-date">{{ m.date }}</span>
                      </div>
                      <div class="m-dot-col">
                        <div class="m-dot"></div>
                        <div class="m-line"></div>
                      </div>
                      <div class="m-info-col">
                        <strong class="m-status">{{ m.status }} — {{ m.location }}</strong>
                        <p class="m-desc">{{ m.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="st-footer" *ngIf="selectedOrderModal()!.carrier && selectedOrderModal()!.trackingNumber">
                <a [href]="getTrackingUrl(selectedOrderModal()!.carrier, selectedOrderModal()!.trackingNumber)" target="_blank" class="track-btn">
                  <i class="fa-solid fa-up-right-from-square"></i> Kargom Nerede? (Canlı Takip Sayfası)
                </a>
              </div>
            </div>

            <!-- Non-Shipped Order Info Card -->
            <div *ngIf="selectedOrderModal()!.status !== 'KARGOYA VERİLDİ' && !selectedOrderModal()!.trackingNumber" class="a-info-card">
              <div class="a-info-header">
                <i class="fa-solid fa-arrows-rotate fa-spin text-purple"></i>
                <div>
                  <strong>Siparişiniz Hazırlanıyor / İşleme Alındı</strong>
                  <p>Tasarım ve üretim süreciniz tamamlandığında kargo ve takip bilgileriniz bu ekranda canlı olarak aktifleşecektir.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="a-modal-footer">
            <button *ngIf="isPending(selectedOrderModal()?.status)" class="btn btn-cancel-order" (click)="openCancelModal(selectedOrderModal()!)">
              <i class="fa-solid fa-triangle-exclamation"></i> İptal Talebi Oluştur
            </button>
            <button *ngIf="invoiceService.hasInvoice(selectedOrderModal()!.code)" class="btn btn-invoice" (click)="openInvoiceModal(selectedOrderModal()!)">
              <i class="fa-solid fa-file-invoice-dollar"></i> E-Fatura Görüntüle / İndir
            </button>
            <span *ngIf="!invoiceService.hasInvoice(selectedOrderModal()!.code)" class="no-invoice-note" title="Muhasebe onayı bekleniyor">
              <i class="fa-solid fa-clock"></i> E-Fatura Bekleniyor
            </span>
            <a href="https://wa.me/905325182234" target="_blank" class="btn btn-secondary">
              <i class="fa-brands fa-whatsapp"></i> Destek Al
            </a>
            <button class="btn btn-primary" (click)="closeOrderDetailModal()">Kapat</button>
          </div>
        </div>
      </div>

      <!-- ── 5. Ultra-Modern Tekil Ürün Değerlendirme & Yorum Yap Modalı ── -->
      <div class="modal-backdrop animate-fadeIn" *ngIf="showReviewModal()" (click)="closeReviewModal()">
        <div class="modal-card review-modal glass-card-lux" (click)="$event.stopPropagation()">
          <button class="modal-close-btn" (click)="closeReviewModal()" title="Kapat">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="rev-header">
            <div class="rev-thumb-ring" *ngIf="selectedReviewItem()">
              <img [src]="selectedReviewItem()?.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400'" [alt]="selectedReviewItem()?.productName" />
            </div>
            <div class="rev-title-group">
              <span class="rev-badge"><i class="fa-solid fa-medal"></i> ÜRÜN DEĞERLENDİRME</span>
              <h3>{{ selectedReviewItem()?.productName }}</h3>
              <p class="rev-sub">
                Sipariş No: <span class="order-code-glow">#{{ reviewOrderData()?.code }}</span>
              </p>
            </div>
          </div>

          <div class="rev-body">
            <!-- 1. Interactive Star Rating Selector with Dynamic Feedback Badge -->
            <div class="rating-box">
              <div class="rating-label-row">
                <label>Puanınız <span class="req">*</span></label>
                <span class="rating-text-badge">
                  {{ getRatingText(reviewForm.rating) }}
                </span>
              </div>
              <div class="star-rating-container">
                <div 
                  *ngFor="let s of [1,2,3,4,5]" 
                  class="star-wrapper" 
                  [class.active]="s <= reviewForm.rating"
                  (click)="reviewForm.rating = s"
                  title="{{ s }} Yıldız"
                >
                  <i class="fa-solid fa-star star-svg"></i>
                  <span class="star-num">{{ s }}</span>
                </div>
              </div>
            </div>

            <!-- 2. Modern Glass Textarea with Character Counter -->
            <div class="comment-input-box">
              <div class="label-with-count">
                <label><i class="fa-solid fa-pen-to-square"></i> Yorumunuz &amp; Deneyiminiz</label>
                <span class="char-count">{{ reviewForm.comment.length }}/500</span>
              </div>
              <textarea 
                [(ngModel)]="reviewForm.comment" 
                rows="4" 
                maxlength="500"
                class="modern-textarea" 
                placeholder="Baskı kalitesi, renk canlılığı, malzeme sağlamlığı ve genel memnuniyetinizi belirtebilirsiniz..."
              ></textarea>
            </div>

            <!-- Success Alert -->
            <div class="alert-success-glow" *ngIf="reviewSuccessMsg()">
              <i class="fa-solid fa-circle-check"></i>
              <span>{{ reviewSuccessMsg() }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="rev-actions-row">
              <button class="btn-ghost-cancel" (click)="closeReviewModal()">
                Vazgeç
              </button>
              <button class="btn-gold-submit" (click)="submitReview()" [disabled]="reviewSubmitting()">
                <i class="fa-solid" [ngClass]="reviewSubmitting() ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                <span>{{ reviewSubmitting() ? 'Gönderiliyor...' : 'Yorumu Yayınla' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 6. E-Fatura Görüntüleme Modalı (Müşteri için Sadece İzleme & İndirme) ── -->
      <app-invoice-modal
        *ngIf="selectedInvoiceOrder()"
        [orderCode]="selectedInvoiceOrder()!.code"
        [orderTitle]="selectedInvoiceOrder()!.title"
        [orderDate]="selectedInvoiceOrder()!.date"
        [allowEdit]="false"
        (closed)="closeInvoiceModal()"
      ></app-invoice-modal>

      <!-- ── 6. Amazon Style Sipariş İptal Talebi Modalı ── -->
      <div class="modal-backdrop animate-fadeIn" *ngIf="showCancelModal()" (click)="closeCancelModal()">
        <div class="modal-card amazon-cancel-modal glass-card" (click)="$event.stopPropagation()">
          <button class="modal-close-btn" (click)="closeCancelModal()" title="Kapat">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="ac-header">
            <div class="ac-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <div>
              <h3>Sipariş İptal Talebi Oluştur</h3>
              <p class="ac-sub">Sipariş <strong>#{{ cancelOrderData()?.code }}</strong> — {{ cancelOrderData()?.title }}</p>
            </div>
          </div>

          <form (ngSubmit)="submitCancelRequest()" class="ac-body">
            <div class="form-group">
              <label>İptal Nedeni Seçiniz <span class="req">*</span></label>
              <select [(ngModel)]="cancelForm.reason" name="reason" class="form-control" required>
                <option value="Yanlış Ürün / Adet Seçimi">Yanlış Ürün / Adet Seçimi Yapıldı</option>
                <option value="Teslimat Süresi / Aciliyet Değişikliği">Teslimat Süresi / Aciliyet Değişikliği</option>
                <option value="Fiyat veya Tasarım Değişikliği Talebi">Fiyat veya Tasarım Değişikliği Talebi</option>
                <option value="Vazgeçtim / Başka Ürün Alacağım">Vazgeçtim / Başka Ürün Alacağım</option>
                <option value="Diğer">Diğer / Özel Sebep</option>
              </select>
            </div>

            <div class="form-group">
              <label>Açıklama &amp; Notunuz (İsteğe Bağlı)</label>
              <textarea
                [(ngModel)]="cancelForm.note"
                name="note"
                class="form-control"
                rows="3"
                placeholder="İptal talebiniz hakkında detay belirtin..."
              ></textarea>
            </div>

            <div class="ac-notice-box">
              <i class="fa-solid fa-shield-halved"></i>
              <span>İptal talebiniz müşteri temsilcimiz tarafından incelenip onaylandıktan sonra siparişiniz iptal edilecek ve ödemeniz iade edilecektir.</span>
            </div>

            <div class="ac-actions">
              <button type="button" class="btn btn-secondary" (click)="closeCancelModal()">Vazgeç</button>
              <button type="submit" class="btn btn-danger-gradient">
                <i class="fa-solid fa-paper-plane"></i> İptal Talebini Gönder
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .cust-page { display: flex; flex-direction: column; gap: 22px; }

    /* ── Banner ── */
    .profile-banner {
      padding: 28px 32px;
      display: flex; align-items: center; justify-content: space-between; gap: 20px;
      background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.07) 100%);
      border-left: 4px solid var(--secondary); flex-wrap: wrap;
    }
    .banner-left { display: flex; align-items: center; gap: 22px; }
    .avatar-ring {
      position: relative; width: 76px; height: 76px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--secondary), var(--accent-emerald));
      padding: 3px; box-shadow: 0 0 28px rgba(6,182,212,0.35);
    }
    .avatar-body {
      width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
      background: var(--bg-secondary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; font-weight: 900; color: var(--secondary);
    }
    .avatar-body img { width: 100%; height: 100%; object-fit: cover; }
    .online-badge {
      position: absolute; bottom: 4px; right: 4px;
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--status-success); border: 2.5px solid var(--bg-secondary);
      box-shadow: 0 0 8px var(--status-success);
    }
    .profile-tag {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--secondary); background: rgba(6,182,212,0.12);
      border: 1px solid rgba(6,182,212,0.25); padding: 4px 10px; border-radius: 99px;
      margin-bottom: 6px;
    }
    .profile-info { display: flex; flex-direction: column; gap: 4px; }
    .profile-info h1 { font-size: 1.65rem; font-weight: 900; margin: 0; }
    .profile-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 4px; }
    .profile-meta span { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }
    .profile-meta i { font-size: 0.72rem; color: var(--secondary); }
    .banner-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .banner-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: var(--radius-md);
      font-size: 0.86rem; font-weight: 700; text-decoration: none;
      transition: all 0.2s;
    }
    .secondary-btn {
      background: var(--bg-card); border: 1px solid var(--glass-border); color: var(--text-main);
    }
    .secondary-btn:hover { border-color: var(--secondary); color: var(--secondary); transform: translateY(-2px); }
    .whatsapp-btn {
      background: linear-gradient(135deg, #25D366, #128C7E); color: #fff;
      box-shadow: 0 4px 14px rgba(37,211,102,0.3);
    }
    .whatsapp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,211,102,0.4); color: #fff; }

    /* ── Summary Row ── */
    .summary-row { display: flex; gap: 14px; flex-wrap: wrap; }
    .summary-chip {
      flex: 1; min-width: 140px;
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
    }
    .chip-total { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); }
    .chip-pending { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05)); }
    .chip-done { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); }
    .chip-total i { font-size: 1.4rem; color: var(--primary); }
    .chip-pending i { font-size: 1.4rem; color: #f59e0b; }
    .chip-done i { font-size: 1.4rem; color: var(--accent-emerald); }
    .chip-val { display: block; font-size: 1.7rem; font-weight: 900; line-height: 1; }
    .chip-lbl { font-size: 0.74rem; color: var(--text-muted); font-weight: 600; }

    /* ── Content Grid ── */
    .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
    @media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } }
    .right-col { display: flex; flex-direction: column; gap: 18px; }

    /* ── Section Header ── */
    .section-header {
      display: flex; align-items: center; gap: 14px; padding: 20px 24px;
      border-bottom: 1px solid var(--glass-border);
    }
    .section-header.compact { padding: 16px 20px; border-bottom: 1px solid var(--glass-border); }
    .section-header h2 { font-size: 1rem; font-weight: 800; margin: 0; flex: 1; }
    .section-sub { font-size: 0.74rem; color: var(--text-muted); margin: 2px 0 0; }
    .section-title-group { display: flex; align-items: center; gap: 14px; flex: 1; }
    .section-icon {
      width: 38px; height: 38px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;
    }
    .section-icon.cyan { background: rgba(6,182,212,0.15); color: var(--secondary); }
    .section-icon.purple { background: rgba(168,85,247,0.15); color: var(--accent-purple); }
    .section-icon.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .section-icon.emerald { background: rgba(16,185,129,0.15); color: var(--accent-emerald); }
    .icon-refresh-btn {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-muted); font-size: 0.85rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .icon-refresh-btn:hover { color: var(--secondary); border-color: var(--secondary); }
    .icon-refresh-btn.spinning i { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Orders Card ── */
    .orders-card { padding: 0; overflow: hidden; }
    .orders-body { display: flex; flex-direction: column; }
    .empty-body { padding: 20px; }
    .empty-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 48px 24px; text-align: center;
    }
    .empty-circle {
      width: 72px; height: 72px; border-radius: 50%;
      border: 2px dashed var(--glass-border); background: rgba(255,255,255,0.03);
      display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--text-dim);
    }
    .empty-wrap h3 { font-size: 1.05rem; margin: 0; }
    .empty-wrap p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 8px; margin-top: 4px;
      padding: 10px 20px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--secondary), var(--accent-emerald));
      color: #fff; font-weight: 700; font-size: 0.86rem; text-decoration: none;
      box-shadow: 0 4px 14px rgba(6,182,212,0.3); transition: all 0.2s;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(6,182,212,0.4); color: #fff; }
    .order-row-card {
      padding: 16px 20px; border-bottom: 1px solid var(--glass-border);
      transition: all 0.2s ease; animation: fadeUp 0.3s ease both;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .order-row-card:last-child { border-bottom: none; }
    .order-row-card:hover { background: rgba(6,182,212,0.04); }

    .order-row-main { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .order-num-badge {
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.68rem; font-weight: 800; color: var(--text-dim); flex-shrink: 0;
    }
    .order-icon-wrap {
      width: 42px; height: 42px; border-radius: var(--radius-md);
      background: rgba(6,182,212,0.12); color: var(--secondary);
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
    }
    .order-info { flex: 1; min-width: 200px; }
    .order-info h4 { font-size: 0.92rem; margin: 0 0 4px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .order-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .meta-code { font-family: monospace; font-size: 0.74rem; font-weight: 700; color: var(--primary); }
    .meta-sep { color: var(--text-dim); }
    .meta-date { font-size: 0.74rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; }
    .order-status-col { flex-shrink: 0; }
    .order-action-col { margin-left: auto; display: flex; gap: 8px; }

    .amazon-track-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(99,102,241,0.12) 100%);
      border: 1.5px solid rgba(6,182,212,0.3); color: var(--cyan);
      font-size: 0.82rem; font-weight: 800; cursor: pointer; transition: all 0.2s ease;
    }
    .amazon-track-btn:hover { background: rgba(6,182,212,0.22); color: var(--cyan); border-color: rgba(6,182,212,0.4); transform: translateY(-1px); }
    .invoice-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--radius-md);
      background: rgba(16,185,129,0.12); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3);
      font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;
    }
    .invoice-btn:hover { background: rgba(16,185,129,0.25); border-color: rgba(16,185,129,0.5); transform: translateY(-1px); }
    .btn-invoice {
      background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15));
      color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.4);
      padding: 8px 16px; border-radius: var(--radius-md); font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-invoice:hover { background: rgba(16,185,129,0.3); transform: translateY(-1px); }
    .btn-cancel-order {
      background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);
      padding: 8px 16px; border-radius: var(--radius-md); font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel-order:hover { background: rgba(239,68,68,0.28); border-color: rgba(239,68,68,0.5); transform: translateY(-1px); }

    /* Amazon Cancel Modal */
    .amazon-cancel-modal { max-width: 520px; width: 92%; border-top: 4px solid #ef4444; }
    .ac-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .ac-icon {
      width: 46px; height: 46px; border-radius: 50%; background: rgba(239,68,68,0.18);
      color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;
    }
    .ac-header h3 { font-size: 1.1rem; font-weight: 800; margin: 0 0 2px; }
    .ac-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .ac-body { display: flex; flex-direction: column; gap: 16px; text-align: left; }
    .ac-notice-box {
      display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md);
      background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; font-size: 0.78rem; line-height: 1.4;
    }
    .ac-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .btn-danger-gradient {
      background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none;
      padding: 10px 20px; border-radius: var(--radius-md); font-weight: 800; font-size: 0.86rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-danger-gradient:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(239,68,68,0.4); }
    .no-invoice-note {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-dim);
      background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); padding: 6px 12px; border-radius: var(--radius-md);
    }

    /* Amazon Style Order Detail Modal */
    .amazon-order-modal { max-width: 680px; width: 92%; border-top: 4px solid var(--cyan); max-height: 90vh; overflow-y: auto; text-align: left; }
    .a-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--glass-border); margin-bottom: 16px; }
    .a-badge-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .a-order-code { font-size: 0.8rem; font-weight: 800; color: var(--cyan); font-family: monospace; }
    .a-modal-header h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text-main); }
    .a-order-date { font-size: 0.78rem; color: var(--text-muted); margin: 4px 0 0 0; }

    .a-cargo-card {
      padding: 18px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.06) 100%);
      border: 1.5px solid rgba(6,182,212,0.3); display: flex; flex-direction: column; gap: 14px;
    }

    .a-info-card {
      padding: 20px; border-radius: var(--radius-md);
      background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
    }
    .a-info-header { display: flex; align-items: center; gap: 14px; }
    .a-info-header i { font-size: 1.6rem; }
    .a-info-header strong { display: block; font-size: 0.95rem; color: var(--text-main); margin-bottom: 2px; }
    .a-info-header p { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    .a-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--glass-border); }

    .orders-footer {
      padding: 14px 20px; border-top: 1px solid var(--glass-border);
      background: rgba(0,0,0,0.1);
    }
    .new-order-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.82rem; font-weight: 700; color: var(--secondary); text-decoration: none;
      transition: gap 0.2s;
    }
    .new-order-link:hover { gap: 10px; }

    /* ── Status Pill ── */
    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 11px; border-radius: 99px; font-size: 0.71rem; font-weight: 800; white-space: nowrap;
    }
    .sdot { width: 6px; height: 6px; border-radius: 50%; }
    .pill-pending { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
    .pill-pending .sdot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; animation: pulse 2s infinite; }
    .pill-approved { background: rgba(16,185,129,0.15); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3); }
    .pill-approved .sdot { background: var(--accent-emerald); }
    .pill-production { background: rgba(99,102,241,0.15); color: var(--primary); border: 1px solid rgba(99,102,241,0.3); }
    .pill-production .sdot { background: var(--primary); }
    .pill-shipped { background: rgba(6,182,212,0.15); color: var(--secondary); border: 1px solid rgba(6,182,212,0.3); }
    .pill-shipped .sdot { background: var(--secondary); }
    .pill-default { background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid var(--glass-border); }
    .pill-default .sdot { background: var(--text-dim); }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    /* ── Skeleton ── */
    .order-skel { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--glass-border); }
    .sk-icon { width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(255,255,255,0.06); flex-shrink: 0; }
    .sk-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .sk-line {
      height: 13px; border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    .sk-line.long { width: 70%; } .sk-line.short { width: 45%; }
    .sk-badge { width: 80px; height: 22px; border-radius: 99px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── Fixed Modal Backdrop Overlay ── */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .order-title-link:hover { text-decoration: underline; text-underline-offset: 3px; }
    .clickable-code:hover { color: var(--secondary); }
    .modal-card {
      position: relative; border-radius: var(--radius-lg); background: var(--bg-card);
      box-shadow: 0 24px 48px rgba(0,0,0,0.5); padding: 24px; border: 1.5px solid var(--glass-border);
    }
    .modal-close-btn {
      position: absolute; top: 16px; right: 16px;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
      color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
    }
    .modal-close-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; border-color: rgba(239,68,68,0.3); }

    /* ── Tracking & Movements Styles ── */
    .interactive-cargo-tracker {
      margin-top: 8px; padding: 16px 18px; border-radius: var(--radius-md);
      background: linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%);
      border: 1px solid var(--glass-border); position: relative; display: flex; flex-direction: column; gap: 14px;
    }
    .tracker-progress-track {
      position: relative; height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; margin: 10px 24px 0;
    }
    .tracker-progress-fill {
      height: 100%; border-radius: 9999px;
      background: linear-gradient(90deg, var(--emerald) 0%, var(--cyan) 70%, var(--primary) 100%);
      box-shadow: 0 0 12px var(--cyan); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .moving-truck {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 32px; height: 32px; border-radius: 50%;
      background: #0f172a; border: 2px solid var(--cyan); color: var(--cyan);
      display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
      box-shadow: 0 0 14px var(--cyan); transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1); z-index: 3;
    }
    .tracker-steps { display: flex; justify-content: space-between; position: relative; z-index: 2; }
    .istep { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: transform 0.2s ease; }
    .istep:hover { transform: translateY(-3px); }
    .istep-node {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--bg-card); border: 2px solid var(--glass-border); color: var(--text-dim);
      display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.3s ease;
    }
    .istep-label { font-size: 0.76rem; font-weight: 600; color: var(--text-dim); }
    .istep-done .istep-node { background: rgba(16,185,129,0.18); border-color: var(--emerald); color: var(--emerald); box-shadow: 0 0 10px rgba(16,185,129,0.3); }
    .istep-done .istep-label { color: var(--emerald); font-weight: 700; }
    .istep-active .istep-node {
      background: rgba(6,182,212,0.25); border-color: var(--cyan); color: var(--cyan);
      box-shadow: 0 0 16px var(--cyan); animation: pulseGlow 2s infinite;
    }
    .istep-active .istep-label { color: var(--cyan); font-weight: 800; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 10px rgba(6,182,212,0.4); }
      50% { box-shadow: 0 0 22px rgba(6,182,212,0.8); }
    }
    .step-detail-card {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm);
      background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); margin-top: 2px;
    }
    .sd-icon { font-size: 1.3rem; flex-shrink: 0; }
    .sd-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .sd-content strong { font-size: 0.84rem; color: var(--text-main); }
    .sd-content p { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
    .sd-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; }
    .sd-close:hover { color: var(--status-danger); }
    .cargo-movements-section { margin-top: 6px; }
    .toggle-movements-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 8px 12px; border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
      color: var(--cyan); font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .toggle-movements-btn:hover { background: rgba(6,182,212,0.12); }
    .movements-list {
      display: flex; flex-direction: column; gap: 0; margin-top: 8px;
      background: rgba(0,0,0,0.2); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);
    }
    .movement-item { display: flex; gap: 12px; position: relative; padding-bottom: 12px; }
    .movement-item:last-child { padding-bottom: 0; }
    .m-time-col { display: flex; flex-direction: column; width: 80px; flex-shrink: 0; text-align: right; }
    .m-time { font-size: 0.78rem; font-weight: 800; color: var(--cyan); }
    .m-date { font-size: 0.66rem; color: var(--text-dim); }
    .m-dot-col { display: flex; flex-direction: column; align-items: center; position: relative; padding-top: 4px; }
    .m-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); z-index: 1; flex-shrink: 0; }
    .m-line { width: 2px; flex: 1; background: rgba(255,255,255,0.15); margin-top: 4px; }
    .m-info-col { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .m-status { font-size: 0.8rem; color: var(--text-main); font-weight: 700; }
    .m-desc { font-size: 0.74rem; color: var(--text-muted); margin: 0; line-height: 1.35; }
    .st-footer { display: flex; justify-content: flex-end; margin-top: 4px; }
    .track-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: var(--radius-sm);
      background: var(--cyan); color: #0f172a; font-size: 0.8rem; font-weight: 800;
      text-decoration: none; transition: all 0.2s ease;
    }
    .track-btn:hover { background: #22d3ee; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(6,182,212,0.35); }
    .st-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .st-title-group { display: flex; align-items: center; gap: 10px; }
    .st-title-group i { font-size: 1.2rem; color: var(--cyan); }
    .st-title-group strong { display: block; font-size: 0.88rem; color: var(--text-main); }
    .st-sub { font-size: 0.76rem; color: var(--text-muted); }
    .st-badge {
      font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 9999px;
      background: rgba(6,182,212,0.2); color: var(--cyan); border: 1px solid rgba(6,182,212,0.4);
    }
    .st-body { display: flex; flex-direction: column; gap: 8px; }
    .st-code-row { display: flex; align-items: center; gap: 8px; font-size: 0.84rem; flex-wrap: wrap; }
    .st-label { color: var(--text-dim); font-weight: 600; min-width: 105px; }
    .st-val { color: var(--text-main); font-size: 0.88rem; }
    .st-code { font-weight: 800; color: var(--cyan); letter-spacing: 0.05em; font-family: monospace; font-size: 0.95rem; }
    .st-note { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0 0; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--cyan); }
    .copy-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
      color: var(--text-muted); font-size: 0.74rem; cursor: pointer; transition: all 0.2s ease;
      margin-left: 6px;
    }
    .copy-btn:hover { background: rgba(99,102,241,0.15); color: var(--primary); border-color: rgba(99,102,241,0.3); }
    /* ── Review & Wishlist Styles ── */
    .review-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--radius-md);
      background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3);
      font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;
    }
    .review-btn:hover { background: rgba(245,158,11,0.25); border-color: rgba(245,158,11,0.5); transform: translateY(-1px); }

    .wishlist-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; padding: 16px;
    }
    .wishlist-item-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-md);
      overflow: hidden; transition: all 0.25 ease; display: flex; flex-direction: column;
    }
    .wishlist-item-card:hover { transform: translateY(-3px); border-color: rgba(244,63,94,0.4); box-shadow: 0 10px 24px rgba(0,0,0,0.3); }
    .w-img-box { position: relative; height: 160px; overflow: hidden; background: #000; }
    .w-img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .wishlist-item-card:hover .w-img-box img { transform: scale(1.05); }
    .w-remove-btn {
      position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%;
      background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: #ef4444;
      cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
      transition: all 0.2s;
    }
    .w-remove-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
    .w-details { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; justify-content: space-between; }
    .w-cat { font-size: 0.72rem; font-weight: 700; color: var(--cyan); text-transform: uppercase; }
    .w-details h4 { font-size: 0.95rem; font-weight: 700; margin: 0; }
    .w-price-row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; pt: 8px; border-top: 1px solid var(--glass-border); }
    .w-price { font-size: 1.1rem; font-weight: 800; color: #fff; }
    .w-order-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--secondary), var(--cyan)); color: #fff; font-size: 0.78rem;
      font-weight: 700; text-decoration: none; transition: all 0.2s;
    }
    .w-order-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(6,182,212,0.4); }

    /* ── Purchased Items in Order Detail ── */
    .order-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge-extra-items {
      font-size: 0.72rem; font-weight: 700; background: rgba(6,182,212,0.12);
      color: var(--secondary); border: 1px solid rgba(6,182,212,0.3);
      padding: 2px 8px; border-radius: 99px;
    }
    .meta-items-qty, .meta-total-amount {
      display: inline-flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--text-muted);
    }
    .meta-total-amount { color: var(--accent-emerald); font-weight: 700; }

    .purchased-items-section {
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 20px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .pis-header {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      border-bottom: 1px solid var(--glass-border); padding-bottom: 12px; flex-wrap: wrap;
    }
    .pis-title-group { display: flex; align-items: center; gap: 12px; }
    .pis-title-group i { font-size: 1.2rem; }
    .pis-sub { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .pis-total-badge {
      font-size: 0.82rem; font-weight: 800; color: #10b981;
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
      padding: 4px 10px; border-radius: 8px;
    }
    .purchased-items-list { display: flex; flex-direction: column; gap: 10px; }
    .purchased-item-row {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
      border-radius: var(--radius-md); transition: all 0.2s; flex-wrap: wrap;
    }
    .purchased-item-row:hover { background: rgba(6,182,212,0.04); border-color: rgba(6,182,212,0.3); }
    .p-item-thumb {
      width: 52px; height: 52px; border-radius: 8px; overflow: hidden; background: #000;
      flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);
    }
    .p-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .p-item-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
    .p-item-title { font-size: 0.92rem; font-weight: 700; margin: 0; color: var(--text-main); }
    .p-item-meta-row {
      display: flex; align-items: center; gap: 8px; font-size: 0.78rem;
      color: var(--text-muted); flex-wrap: wrap;
    }
    .p-item-qty { color: var(--secondary); font-weight: 700; }
    .p-item-sep { color: var(--text-dim); }
    .p-item-unit { color: var(--text-muted); }
    .p-item-total { color: #fff; }
    .p-item-review-action { flex-shrink: 0; }
    .btn-item-review {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.15) 100%);
      border: 1px solid rgba(245,158,11,0.4); color: #f59e0b; font-weight: 700;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-item-review:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
      box-shadow: 0 4px 14px rgba(245,158,11,0.4); transform: translateY(-1px);
    }
    .badge-item-reviewed {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem;
      font-weight: 700; color: #10b981; background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.3); padding: 5px 10px; border-radius: var(--radius-sm);
    }
    .rev-thumb-ring {
      width: 54px; height: 54px; border-radius: 12px; overflow: hidden; background: #000;
      flex-shrink: 0; border: 1.5px solid rgba(245,158,11,0.5);
      box-shadow: 0 0 16px rgba(245,158,11,0.25);
    }
    .rev-thumb-ring img { width: 100%; height: 100%; object-fit: cover; }

    /* ── Luxury Ultra-Modern Review Modal ── */
    .glass-card-lux {
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(245, 158, 11, 0.3);
      box-shadow: 0 32px 64px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.15);
      border-radius: 20px;
    }
    .review-modal { max-width: 540px; width: 92%; padding: 28px; text-align: left; }
    .rev-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .rev-icon-ring {
      width: 52px; height: 52px; border-radius: 16px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.12) 100%);
      border: 1.5px solid rgba(245, 158, 11, 0.4); color: #f59e0b;
      display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); flex-shrink: 0;
    }
    .rev-title-group { display: flex; flex-direction: column; gap: 4px; }
    .rev-badge {
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.68rem; font-weight: 800;
      color: #f59e0b; letter-spacing: 0.08em; text-transform: uppercase;
      background: rgba(245, 158, 11, 0.12); padding: 3px 8px; border-radius: 6px; width: fit-content;
    }
    .rev-title-group h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: #fff; }
    .rev-sub { font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.4; }
    .order-code-glow { font-family: monospace; font-weight: 800; color: #f59e0b; }

    .rev-body { display: flex; flex-direction: column; gap: 20px; }

    /* Star Rating Box */
    .rating-box {
      display: flex; flex-direction: column; gap: 10px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px; border-radius: 14px;
    }
    .rating-label-row { display: flex; align-items: center; justify-content: space-between; }
    .rating-label-row label { font-size: 0.86rem; font-weight: 700; color: var(--text-main); }
    .req { color: #ef4444; }
    .rating-text-badge {
      font-size: 0.78rem; font-weight: 800; padding: 4px 10px; border-radius: 8px;
      background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .star-rating-container { display: flex; align-items: center; gap: 12px; }
    .star-wrapper {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .star-wrapper:hover { transform: scale(1.25); }
    .star-svg { font-size: 1.8rem; color: rgba(255, 255, 255, 0.18); transition: all 0.2s ease; }
    .star-wrapper.active .star-svg {
      color: #f59e0b; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8)); transform: scale(1.08);
    }
    .star-num { font-size: 0.7rem; font-weight: 800; color: var(--text-dim); }
    .star-wrapper.active .star-num { color: #f59e0b; }

    /* Modern Textarea */
    .comment-input-box { display: flex; flex-direction: column; gap: 8px; }
    .label-with-count { display: flex; align-items: center; justify-content: space-between; }
    .label-with-count label { font-size: 0.86rem; font-weight: 700; color: var(--text-main); display: inline-flex; align-items: center; gap: 6px; }
    .char-count { font-size: 0.75rem; font-weight: 700; color: var(--text-dim); }

    .modern-textarea {
      width: 100%; box-sizing: border-box;
      background: rgba(15, 23, 42, 0.65); border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px; color: #fff; padding: 14px 16px;
      font-family: var(--font-body), system-ui, -apple-system, sans-serif;
      font-size: 0.88rem; line-height: 1.55; outline: none; resize: vertical; min-height: 110px;
      transition: all 0.25s ease;
    }
    .modern-textarea:focus {
      border-color: #f59e0b; background: rgba(15, 23, 42, 0.85);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
    }
    .modern-textarea::placeholder { color: rgba(255, 255, 255, 0.35); font-style: normal; }

    /* Alert Glow */
    .alert-success-glow {
      display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px;
      background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981; font-weight: 700; font-size: 0.85rem; box-shadow: 0 0 16px rgba(16, 185, 129, 0.2);
    }

    /* Actions Row */
    .rev-actions-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 4px; }
    .btn-ghost-cancel {
      background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--text-muted); padding: 10px 20px; border-radius: 10px;
      font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost-cancel:hover { background: rgba(255, 255, 255, 0.14); color: #fff; }

    .btn-gold-submit {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border: none; color: #fff; padding: 11px 24px; border-radius: 10px;
      font-weight: 800; font-size: 0.88rem; letter-spacing: 0.02em; cursor: pointer;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-gold-submit:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 10px 28px rgba(245, 158, 11, 0.5);
    }
    .btn-gold-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .text-rose { color: #f43f5e; }
    .text-rose-btn { background: linear-gradient(135deg, #f43f5e, #e11d48) !important; box-shadow: 0 4px 14px rgba(244,63,94,0.3) !important; }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  public invoiceService = inject(InvoiceService);
  private apiService = inject(ApiService);

  activeOrders = signal<CustomerOrderDto[]>([]);
  wishlistItems = signal<any[]>([]);
  loading = false;
  copiedCode = signal<string | null>(null);
  selectedOrderModal = signal<CustomerOrderDto | null>(null);
  selectedInvoiceOrder = signal<CustomerOrderDto | null>(null);
  showCancelModal = signal<boolean>(false);
  cancelOrderData = signal<CustomerOrderDto | null>(null);

  // Review & Rating Modal signals
  showReviewModal = signal<boolean>(false);
  reviewOrderData = signal<CustomerOrderDto | null>(null);
  selectedReviewItem = signal<any | null>(null);
  reviewForm = { rating: 5, comment: '' };
  reviewSubmitting = signal<boolean>(false);
  reviewSuccessMsg = signal<string | null>(null);

  cancelForm = {
    reason: 'Yanlış Ürün / Adet Seçimi',
    note: ''
  };

  selectedStepMap = signal<Record<string, number>>({});
  openMovementsMap = signal<Record<string, boolean>>({});
  cargoMovementsData = signal<Record<string, CargoMovementDto[]>>({});

  pendingCount = computed(() => this.activeOrders().filter(o => o.status.toLowerCase().includes('bekliyor')).length);
  latestOrder = computed(() => this.activeOrders().length > 0 ? this.activeOrders()[0] : null);

  openOrderDetailModal(order: CustomerOrderDto): void {
    this.selectedOrderModal.set(order);
  }

  closeOrderDetailModal(): void {
    this.selectedOrderModal.set(null);
  }

  openInvoiceModal(order: CustomerOrderDto) {
    this.selectedInvoiceOrder.set(order);
  }

  closeInvoiceModal() {
    this.selectedInvoiceOrder.set(null);
  }

  selectStep(code: string, step: number): void {
    const current = this.selectedStepMap();
    if (current[code] === step) {
      this.selectedStepMap.set({ ...current, [code]: 0 });
    } else {
      this.selectedStepMap.set({ ...current, [code]: step });
    }
  }

  getProgressPercent(status?: string): number {
    if (!status) return 70;
    const s = status.toLowerCase();
    if (s.includes('tamamlandı') || s.includes('teslim')) return 100;
    if (s.includes('kargo') || s.includes('dağıtım') || s.includes('yolda')) return 70;
    if (s.includes('üretim')) return 35;
    return 15;
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 5: return '⭐⭐⭐⭐⭐ 5 - Mükemmel!';
      case 4: return '⭐⭐⭐⭐ 4 - Çok İyi';
      case 3: return '⭐⭐⭐ 3 - Ortalama / İdare Eder';
      case 2: return '⭐⭐ 2 - Zayıf';
      case 1: return '⭐ 1 - Çok Kötü';
      default: return '⭐⭐⭐⭐⭐ 5 - Mükemmel!';
    }
  }

  getStepState(status: string | undefined, step: number): 'done' | 'active' | 'pending' {
    const p = this.getProgressPercent(status);
    if (step === 1) return p >= 35 ? (p > 35 ? 'done' : 'active') : 'pending';
    if (step === 2) return p >= 70 ? (p > 70 ? 'done' : 'active') : 'pending';
    if (step === 3) return p >= 100 ? 'done' : 'pending';
    return 'pending';
  }

  getStepTitle(step: number): string {
    if (step === 1) return '1. Aşama — Kargoya Teslim Edildi';
    if (step === 2) return '2. Aşama — Transfer Merkezinde & Dağıtımda';
    if (step === 3) return '3. Aşama — Teslimat Adresine Varış';
    return '';
  }

  getStepDesc(step: number, carrier?: string): string {
    const c = carrier || 'Kargo Firması';
    if (step === 1) return `${c} şubesi paketinizi teslim aldı ve barkodlayarak ana transfer merkezine sevk etti.`;
    if (step === 2) return `Paketiniz transfer aracına yüklendi ve ${c} varış şubesinden kurye dağıtım rotasına eklendi.`;
    if (step === 3) return `Kurye gün içinde adresinize uğrayarak teslimatı kimlik doğrulama ile gerçekleştirecektir.`;
    return '';
  }

  toggleMovements(code: string, carrier?: string, trackingNumber?: string): void {
    const current = this.openMovementsMap();
    const isOpen = !current[code];
    this.openMovementsMap.set({ ...current, [code]: isOpen });

    if (isOpen && !this.cargoMovementsData()[code]) {
      this.apiService.trackCargo(carrier, trackingNumber).subscribe(res => {
        if (res && res.movements) {
          this.cargoMovementsData.update(map => ({ ...map, [code]: res.movements }));
        }
      });
    }
  }

  isMovementsOpen(code: string): boolean {
    return !!this.openMovementsMap()[code];
  }

  getCargoMovements(code: string): CargoMovementDto[] {
    return this.cargoMovementsData()[code] || [];
  }

  copyTrackingNumber(code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode.set(code);
      setTimeout(() => this.copiedCode.set(null), 2500);
    }).catch(() => {
      this.copiedCode.set(code);
      setTimeout(() => this.copiedCode.set(null), 2500);
    });
  }

  isTestTrackingCode(code?: string): boolean {
    if (!code) return false;
    const clean = code.trim();
    return clean === '000000000000' || /^0+$/.test(clean) || clean.toLowerCase().includes('test');
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName || '';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadWishlist();
  }

  loadWishlist(): void {
    const localItems: any[] = JSON.parse(localStorage.getItem('gokturk_wishlist') || '[]');
    this.apiService.getWishlist().subscribe({
      next: (serverItems) => {
        if (serverItems && serverItems.length > 0) {
          const merged = [...serverItems];
          for (const loc of localItems) {
            if (!merged.some(m => m.productId === loc.productId || m.productCode === loc.productCode)) {
              merged.push(loc);
            }
          }
          this.wishlistItems.set(merged);
        } else {
          this.wishlistItems.set(localItems);
        }
      },
      error: () => { this.wishlistItems.set(localItems); }
    });
  }

  removeFromWishlist(productId: string): void {
    const updated = this.wishlistItems().filter(item => item.productId !== productId && item.productCode !== productId);
    this.wishlistItems.set(updated);
    localStorage.setItem('gokturk_wishlist', JSON.stringify(updated));

    this.apiService.toggleWishlist(productId).subscribe(() => {
      this.loadWishlist();
    });
  }

  /* ── Order Item Parsing & Breakdown Helpers ── */

  getOrderItems(order: CustomerOrderDto): any[] {
    if (order.items && order.items.length > 0) {
      return order.items;
    }

    // Fallback: Parse comma-separated legacy order title into structured item objects
    const rawTitle = order.title || 'Özel Ürün Siparişi';
    const parts = rawTitle.split(/,\s*(?=[A-ZÇĞİÖŞÜa-zçğıöşü])/);
    
    return parts.map((part, index) => {
      const matchQty = part.match(/\((\d+)\s*Adet\)/i);
      const qty = matchQty ? parseInt(matchQty[1], 10) : 1;
      const cleanName = part.replace(/\(\d+\s*Adet\)/i, '').trim();

      let imageUrl = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400';
      const lower = cleanName.toLowerCase();
      if (lower.includes('anahtarlık') || lower.includes('deri')) {
        imageUrl = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400';
      } else if (lower.includes('saat') || lower.includes('duvar')) {
        imageUrl = 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400';
      } else if (lower.includes('kartvizit')) {
        imageUrl = 'https://images.unsplash.com/photo-1593085260707-5377ba37f868?w=400';
      } else if (lower.includes('usb') || lower.includes('bellek')) {
        imageUrl = 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=400';
      } else if (lower.includes('kalem')) {
        imageUrl = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400';
      }

      return {
        productId: `item-${order.code}-${index}`,
        productName: cleanName,
        quantity: qty,
        unitPrice: 0,
        totalPrice: 0,
        imageUrl: imageUrl,
        isReviewed: false
      };
    });
  }

  getOrderMainTitle(order: CustomerOrderDto): string {
    const items = this.getOrderItems(order);
    if (items.length === 0) return order.title || 'Özel Sipariş';
    return `${items[0].productName} (${items[0].quantity} Adet)`;
  }

  getOrderExtraCount(order: CustomerOrderDto): number {
    const items = this.getOrderItems(order);
    return items.length > 1 ? items.length - 1 : 0;
  }

  getOrderTotalQuantity(order: CustomerOrderDto): number {
    const items = this.getOrderItems(order);
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  openItemReviewModal(order: CustomerOrderDto, item: any): void {
    this.reviewOrderData.set(order);
    this.selectedReviewItem.set(item);
    this.reviewForm = { rating: 5, comment: '' };
    this.reviewSuccessMsg.set(null);
    this.showReviewModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.reviewOrderData.set(null);
    this.selectedReviewItem.set(null);
  }

  submitReview(): void {
    const order = this.reviewOrderData();
    const item = this.selectedReviewItem();
    if (!order || !item) return;

    this.reviewSubmitting.set(true);
    const productId = item.productId && item.productId.length === 36
      ? item.productId
      : '11111111-1111-1111-1111-111111111111';

    this.apiService.submitProductReview(productId, this.reviewForm).subscribe({
      next: () => {
        this.finishItemReview(order, item);
      },
      error: () => {
        this.finishItemReview(order, item);
      }
    });
  }

  private finishItemReview(order: CustomerOrderDto, item: any): void {
    this.reviewSubmitting.set(false);
    item.isReviewed = true;
    item.userRating = this.reviewForm.rating;

    // Persist in localStorage
    const stored: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
    const idx = stored.findIndex(o => o.code === order.code);
    if (idx !== -1) {
      if (!stored[idx].items) {
        stored[idx].items = this.getOrderItems(stored[idx]);
      }
      const itemIdx = stored[idx].items!.findIndex(i => i.productName === item.productName || i.productId === item.productId);
      if (itemIdx !== -1) {
        stored[idx].items![itemIdx].isReviewed = true;
        stored[idx].items![itemIdx].userRating = this.reviewForm.rating;
      }
      localStorage.setItem('gokturk_orders', JSON.stringify(stored));
    }

    this.reviewSuccessMsg.set(`"${item.productName}" için değerlendirmeniz başarıyla kaydedildi! Teşekkür ederiz.`);
    setTimeout(() => {
      this.closeReviewModal();
      this.loadOrders();
    }, 2000);
  }

  loadOrders(): void {
    this.loading = true;
    this.apiService.getCustomerOrders().subscribe({
      next: (orders) => { this.activeOrders.set(orders); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCancelModal(order: CustomerOrderDto): void {
    this.cancelOrderData.set(order);
    this.cancelForm = { reason: 'Yanlış Ürün / Adet Seçimi', note: '' };
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.cancelOrderData.set(null);
  }

  submitCancelRequest(): void {
    const order = this.cancelOrderData();
    if (!order) return;

    order.status = 'İPTAL TALEBİ';
    order.statusClass = 'badge-danger';
    order.cancellationReason = this.cancelForm.reason;
    order.cancellationNote = this.cancelForm.note;

    const stored: CustomerOrderDto[] = JSON.parse(localStorage.getItem('gokturk_orders') || '[]');
    const idx = stored.findIndex(o => o.code === order.code);
    if (idx !== -1) {
      stored[idx].status = 'İPTAL TALEBİ';
      stored[idx].statusClass = 'badge-danger';
      stored[idx].cancellationReason = this.cancelForm.reason;
      stored[idx].cancellationNote = this.cancelForm.note;
      localStorage.setItem('gokturk_orders', JSON.stringify(stored));
    }

    this.closeCancelModal();
    this.closeOrderDetailModal();
    this.loadOrders();
  }

  getStatusClass(status: string): string {
    if (!status) return 'pill-default';
    const s = status.toLowerCase();
    if (s.includes('bekliyor')) return 'pill-pending';
    if (s.includes('onaylandı') || s === 'onaylandi') return 'pill-approved';
    if (s.includes('üretim') || s.includes('uretim')) return 'pill-production';
    if (s.includes('kargo')) return 'pill-shipped';
    return 'pill-default';
  }

  isPending(status: string | undefined | null): boolean { return !!(status && status.toLowerCase().includes('bekliyor')); }
  isApproved(status: string | undefined | null): boolean { return !!(status && (status.toLowerCase().includes('onaylandı') || status.toLowerCase() === 'onaylandi')); }
  isProduction(status: string | undefined | null): boolean { return !!(status && (status.toLowerCase().includes('üretim') || status.toLowerCase().includes('uretim'))); }
  isShipped(status: string | undefined | null): boolean { return !!(status && status.toLowerCase().includes('kargo')); }

  getTrackingUrl(carrier?: string, trackingNumber?: string): string {
    const code = trackingNumber || '';
    if (!carrier) return '#';
    const c = carrier.toLowerCase();
    if (c.includes('yurtiçi') || c.includes('yurtici')) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgulama?code=${code}`;
    if (c.includes('aras')) return `https://www.araskargo.com.tr/kargo-takip/${code}`;
    if (c.includes('mng')) return `https://www.mngkargo.com.tr/kargotakip?gonderiNo=${code}`;
    if (c.includes('sürat') || c.includes('surat')) return `https://www.suratkargo.com.tr/KargomNerede?takipno=${code}`;
    if (c.includes('trendyol')) return `https://www.trendyol.com/kargo-takip/${code}`;
    if (c.includes('hepsi')) return `https://www.hepsijet.com/kargo-takip/${code}`;
    if (c.includes('ptt')) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${code}`;
    return `https://www.google.com/search?q=${encodeURIComponent((carrier || '') + ' kargo takip ' + code)}`;
  }
}
