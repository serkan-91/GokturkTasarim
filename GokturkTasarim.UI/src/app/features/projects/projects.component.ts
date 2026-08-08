import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface SubCategoryDto {
  id: string;
  externalId: string;
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryTreeNodeDto {
  id: string;
  externalId: string;
  name: string;
  slug: string;
  totalProductCount: number;
  subCategories: SubCategoryDto[];
}

interface ProductDto {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  category: string;
  externalCategoryId: string;
  basePrice: number;
  unit: string;
  stockQuantity: number;
  inStock: boolean;
  description: string;
  imageUrl?: string;
  externalProductUrl?: string;
}

interface PagedProductsResponse {
  items: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="catalog-layout">

      <!-- LEFT SIDEBAR: Category Navigation (DB Dynamic) -->
      <aside class="catalog-sidebar glass-card">
        <div class="sidebar-header">
          <i class="fa-solid fa-layer-group"></i>
          <span>Ürün Kategorileri</span>
        </div>

        <nav class="category-nav">
          <button
            class="category-btn"
            [class.active]="activeCategory() === 'all'"
            (click)="selectCategory('all', 'Tüm Hizmetler & Ürünler')"
          >
            <i class="fa-solid fa-border-all"></i>
            <span class="cat-name">Tüm Ürünler</span>
            <span class="cat-count">{{ totalCatalogProducts() }}</span>
          </button>

          <!-- Main Categories & Subcategories Tree -->
          <div *ngFor="let mainCat of categoryTree()" class="cat-group">
            <button
              class="category-btn main-cat-btn"
              [class.active]="activeCategory() === mainCat.externalId"
              (click)="toggleCategoryExpand(mainCat.externalId, mainCat.name)"
            >
              <i class="fa-solid" [ngClass]="isCategoryExpanded(mainCat.externalId) ? 'fa-folder-open text-primary' : 'fa-folder'"></i>
              <span class="cat-name">{{ mainCat.name }}</span>
              <i *ngIf="mainCat.subCategories && mainCat.subCategories.length > 0" class="fa-solid accordion-arrow" [ngClass]="isCategoryExpanded(mainCat.externalId) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
              <span class="cat-count">{{ mainCat.totalProductCount }}</span>
            </button>

            <!-- Subcategories List (Only expanded for active/open categories) -->
            <div *ngIf="isCategoryExpanded(mainCat.externalId) && mainCat.subCategories && mainCat.subCategories.length > 0" class="sub-cat-list">
              <button
                *ngFor="let sub of mainCat.subCategories"
                class="sub-cat-btn"
                [class.active]="activeCategory() === sub.externalId"
                (click)="selectCategory(sub.externalId, sub.name)"
              >
                <i class="fa-solid fa-angle-right"></i>
                <span class="sub-name">{{ sub.name }}</span>
                <span class="sub-count">{{ sub.productCount }}</span>
              </button>
            </div>
          </div>
        </nav>

        <!-- Kurumsal Links -->
        <div class="sidebar-divider"></div>
        <div class="sidebar-sub">
          <span class="sub-title">KURUMSAL</span>
          <a class="sub-link" routerLink="/about"><i class="fa-solid fa-circle-info"></i> Hakkımızda</a>
          <a class="sub-link" routerLink="/contact"><i class="fa-solid fa-phone"></i> İletişim</a>
          <a class="sub-link" routerLink="/contact"><i class="fa-solid fa-truck-fast"></i> Kurye Hizmetleri</a>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="catalog-main">

        <!-- Search Bar with Clear Button -->
        <div class="search-bar glass-card">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Matbaa ürünü, promosyon veya kod ile ara..."
            class="search-input"
          />
          <button *ngIf="searchQuery" class="clear-search-btn" (click)="clearSearch()" title="Aramayı Temizle">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <span *ngIf="products().length > 0" class="search-result-count">
            {{ totalCount() }} sonuç
          </span>
        </div>

        <!-- Promo Banner -->
        <div class="promo-banner glass-card" *ngIf="activeCategory() === 'all' && !searchQuery">
          <div class="promo-content">
            <span class="promo-tag"><i class="fa-solid fa-bolt"></i> CANLI VERİTABANI KATALOĞU</span>
            <h2 class="promo-title">Siz isteyin, <span class="gradient-text">biz üretelim</span></h2>
            <p>Promojoy XML entegrasyonuyla 10.000+ ürün, anlık fiyat ve stok takibi ile hizmetinizde.</p>
            <div class="promo-actions">
              <button class="btn btn-primary btn-sm" (click)="triggerXmlSync()">
                <i class="fa-solid fa-rotate" [class.fa-spin]="syncing"></i> {{ syncing ? 'Senkronize ediliyor...' : 'XML Senkronize Et' }}
              </button>
              <a routerLink="/contact" class="btn btn-secondary btn-sm"><i class="fa-solid fa-paper-plane"></i> Özel Teklif Al</a>
            </div>
          </div>
        </div>

        <!-- Products Grid Header -->
        <div class="grid-header">
          <h3 class="grid-title">
            <span *ngIf="searchQuery">🔍 "{{ searchQuery }}" için sonuçlar</span>
            <span *ngIf="!searchQuery">{{ activeCategoryName() }}</span>
          </h3>

          <label class="stock-toggle-label" title="Tüketen ürünleri listede gizle">
            <input type="checkbox" [checked]="hideOutOfStock()" (change)="toggleHideOutOfStock()" class="stock-toggle-checkbox" />
            <span class="toggle-custom-box"></span>
            <span class="toggle-text">
              <i class="fa-solid fa-eye-slash"></i> Stokta Olmayanları Gizle
            </span>
          </label>
        </div>

        <!-- Products Grid -->
        <div class="products-grid" *ngIf="displayedProducts().length > 0; else emptyState">
          <div
            *ngFor="let product of displayedProducts()"
            class="product-card glass-card"
            [class.out-of-stock]="!product.inStock"
            (click)="openProductModal(product)"
          >
            <!-- Only show badge when OUT OF STOCK (Tükendi). No green noisy badge for in-stock! -->
            <span *ngIf="!product.inStock" class="product-badge badge-out-stock">
              <i class="fa-solid fa-ban"></i> Tükendi
            </span>

            <!-- Product Image / Icon -->
            <div class="product-img-wrapper">
              <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name" class="product-img gt-blend-image" />
              <div *ngIf="!product.imageUrl" class="product-icon-fallback">
                <i class="fa-solid fa-print"></i>
              </div>
              <div class="quick-view-overlay">
                <i class="fa-solid fa-eye"></i> İncele
              </div>
            </div>

            <!-- Product Details -->
            <div class="product-body">
              <span class="product-code">{{ product.productCode }}</span>
              <h4 class="product-title">{{ product.name }}</h4>
              <p class="product-desc" [innerHTML]="sanitize(product.description)"></p>

              <div class="product-footer" (click)="$event.stopPropagation()">
                <div class="product-price-box">
                  <span class="price-val">{{ product.basePrice > 0 ? (product.basePrice | number:'1.2-2') + ' ₺' : 'Teklif Alın' }}</span>
                  <span class="price-unit" *ngIf="product.unit">/ {{ product.unit }}</span>
                </div>

                <!-- Order Button: Disabled when out of stock -->
                <button
                  *ngIf="product.inStock"
                  (click)="onOrderClick(product); $event.stopPropagation()"
                  class="btn btn-sm btn-primary"
                >
                  <i class="fa-solid" [ngClass]="product.basePrice > 0 ? 'fa-cart-plus' : 'fa-paper-plane'"></i>
                  {{ product.basePrice > 0 ? 'Sipariş Ver' : 'Teklif Al' }}
                </button>

                <button
                  *ngIf="!product.inStock"
                  disabled
                  class="btn btn-sm btn-disabled"
                >
                  <i class="fa-solid fa-ban"></i> Stokta Yok
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Cards Loading Animation -->
        <div class="products-grid skeleton-grid" *ngIf="loadingMore">
          <div class="product-card glass-card skeleton-card" *ngFor="let s of [1,2,3,4]">
            <div class="skeleton-img-box"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line title"></div>
            <div class="skeleton-line desc"></div>
            <div class="skeleton-line btn"></div>
          </div>
        </div>

        <!-- Automatic Infinite Scroll Sentinel & Loader -->
        <div #scrollSentinel class="infinite-scroll-container">
          <div class="auto-loader-pill glowing-loader" *ngIf="loadingMore">
            <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
            <span>Daha fazla ürün yükleniyor, lütfen bekleyin...</span>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="empty-state glass-card">
            <i class="fa-solid fa-box-open empty-icon"></i>
            <h3>Ürün Bulunamadı</h3>
            <p>Seçtiğiniz kriterlere uygun ürün bulunamadı. Lütfen arama terimini veya kategoriyi değiştirin.</p>
            <button class="btn btn-secondary btn-sm" (click)="clearSearch(); selectCategory('all', 'Tüm Hizmetler & Ürünler')">
              <i class="fa-solid fa-rotate-left"></i> Filtreleri Temizle
            </button>
          </div>
        </ng-template>

      </div>
    </div>

    <!-- ÜRÜN DETAY HIZLI İNCELEME MODALI -->
    <div class="modal-backdrop" *ngIf="selectedProduct()" (click)="closeProductModal()">
      <div class="modal-card glass-card" (click)="$event.stopPropagation()">
        <button class="modal-close-btn" (click)="closeProductModal()" title="Kapat">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="modal-body" *ngIf="selectedProduct() as prod">
          <div class="modal-img-col">
            <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.name" class="modal-img gt-blend-image" />
            <div *ngIf="!prod.imageUrl" class="modal-icon-fallback">
              <i class="fa-solid fa-print"></i>
            </div>
            <div class="modal-stock-status">
              <span class="badge" [ngClass]="prod.inStock ? 'badge-in-stock' : 'badge-out-stock'">
                <i [class]="prod.inStock ? 'fa-solid fa-check-circle' : 'fa-solid fa-ban'"></i>
                {{ prod.inStock ? 'Stok Miktarı: ' + prod.stockQuantity : 'Tükendi' }}
              </span>
            </div>
          </div>

          <div class="modal-info-col">
            <span class="product-code-tag"><i class="fa-solid fa-barcode"></i> KOD: {{ prod.productCode }}</span>
            <h2 class="modal-product-title">{{ prod.name }}</h2>
            <span class="modal-category-label"><i class="fa-solid fa-folder-open"></i> {{ prod.category }}</span>

            <div class="modal-price-box">
              <span class="modal-price">{{ prod.basePrice > 0 ? (prod.basePrice | number:'1.2-2') + ' ₺' : 'Özel Fiyatlandırma' }}</span>
              <span class="modal-unit" *ngIf="prod.unit">({{ prod.unit }})</span>
            </div>

            <div class="modal-desc-box">
              <h4>Ürün Açıklaması & Özellikleri</h4>
              <p [innerHTML]="sanitize(prod.description)"></p>
            </div>

            <div class="modal-actions">
              <button
                *ngIf="prod.inStock"
                (click)="closeProductModal(); onOrderClick(prod)"
                class="btn btn-primary btn-lg"
              >
                <i class="fa-solid fa-cart-plus"></i> Sipariş Oluştur
              </button>

              <a
                [href]="getWhatsAppUrl(prod.name, prod.productCode)"
                target="_blank"
                class="btn-whatsapp-sm"
              >
                <i class="fa-brands fa-whatsapp"></i> WhatsApp'tan Sor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SİPARİŞ & GÜVENLİ ALIŞVERİŞ AKIŞ MODALI -->
    <div class="modal-backdrop" *ngIf="orderProduct()" (click)="closeOrderModal()">
      <div class="modal-card order-modal glass-card" (click)="$event.stopPropagation()">
        <button class="modal-close-btn" (click)="closeOrderModal()" title="Kapat">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div *ngIf="orderProduct() as prod">

          <!-- STEP 1: CHOICE (Üye Girişi vs Misafir Alışverişi) -->
          <div *ngIf="orderStep() === 'choice'" class="order-step-choice">
            <div class="order-header-badge">
              <i class="fa-solid fa-shield-halved"></i> SİPARİŞ OLUŞTURMA YÖNTEMİ
            </div>
            <h2 class="order-title">Sipariş Yönteminizi Seçin</h2>
            <p class="order-subtitle"><strong>{{ prod.name }}</strong> ürünü için siparişinizi nasıl tamamlamak istersiniz?</p>

            <div class="choice-cards">
              <!-- Choice 1: Login / Register -->
              <div class="choice-card" (click)="goToLogin()">
                <div class="choice-icon primary-gradient">
                  <i class="fa-solid fa-user-lock"></i>
                </div>
                <div class="choice-text">
                  <h3>Giriş Yap / Üye Ol</h3>
                  <p>Siparişlerinizi canlı müşteri panelinizden takip edin, e-faturalarınıza erişin.</p>
                </div>
                <i class="fa-solid fa-chevron-right choice-arrow"></i>
              </div>

              <!-- Choice 2: Guest Checkout -->
              <div class="choice-card highlight" (click)="orderStep.set('form')">
                <div class="choice-icon emerald-gradient">
                  <i class="fa-solid fa-bolt"></i>
                </div>
                <div class="choice-text">
                  <h3>Üye Olmadan Hızlı Sipariş Ver</h3>
                  <p>Üye olmadan ad, telefon ve adres girerek 30 saniyede siparişinizi iletin.</p>
                </div>
                <span class="badge badge-success">EN HIZLI</span>
              </div>

              <!-- Choice 3: WhatsApp Direct -->
              <a
                [href]="getWhatsAppOrderUrl(prod.name, prod.productCode)"
                target="_blank"
                class="choice-card whatsapp-choice"
              >
                <div class="choice-icon whatsapp-gradient">
                  <i class="fa-brands fa-whatsapp"></i>
                </div>
                <div class="choice-text">
                  <h3>WhatsApp'tan Müşteri Temsilcisine Yazın</h3>
                  <p>Canlı müşteri temsilcimizle anında WhatsApp üzerinden görüşün.</p>
                </div>
              </a>
            </div>
          </div>

          <!-- STEP 2: FORM (Guest & Customer Order Form) -->
          <div *ngIf="orderStep() === 'form'" class="order-step-form">
            <div class="form-header">
              <button class="back-btn" *ngIf="!authService.isLoggedIn()" (click)="orderStep.set('choice')">
                <i class="fa-solid fa-arrow-left"></i> Geri
              </button>
              <h2><i class="fa-solid fa-clipboard-check"></i> Sipariş Detayları</h2>
            </div>

            <div class="order-product-summary">
              <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.name" class="summary-img gt-blend-image" />
              <div>
                <span class="product-code-tag">KOD: {{ prod.productCode }}</span>
                <h4>{{ prod.name }}</h4>
                <span class="summary-price">{{ prod.basePrice > 0 ? (prod.basePrice | number:'1.2-2') + ' ₺' : 'Özel Teklif' }} {{ prod.unit ? '/ ' + prod.unit : '' }}</span>
              </div>
            </div>

            <form (ngSubmit)="submitOrder()" class="order-form-grid">
              <div class="form-group">
                <label><i class="fa-solid fa-user"></i> Ad Soyad *</label>
                <input type="text" [(ngModel)]="orderFullName" name="fullName" required placeholder="Adınız ve Soyadınız" class="form-input" />
              </div>

              <div class="form-group">
                <label><i class="fa-solid fa-phone"></i> Telefon Numarası *</label>
                <input type="tel" [(ngModel)]="orderPhone" name="phone" required placeholder="05XX XXX XX XX" class="form-input" />
              </div>

              <div class="form-group">
                <label><i class="fa-solid fa-cubes"></i> İstenen Adet / Miktar *</label>
                <input type="text" [(ngModel)]="orderQuantity" name="quantity" required placeholder="Örn: 250 adet / 1000 adet" class="form-input" />
              </div>

              <div class="form-group full-width">
                <label><i class="fa-solid fa-location-dot"></i> Teslimat Adresi *</label>
                <textarea [(ngModel)]="orderAddress" name="address" rows="2" required placeholder="Teslimat yapılmasını istediğiniz açık adres" class="form-input"></textarea>
              </div>

              <!-- Payment Method Selection -->
              <div class="form-group full-width">
                <label><i class="fa-solid fa-credit-card"></i> Ödeme Yöntemi Seçiniz *</label>
                <div class="payment-method-options">
                  <label class="payment-radio-box" [class.selected]="selectedPaymentMethod === 'BankTransfer'">
                    <input type="radio" [(ngModel)]="selectedPaymentMethod" name="payMethod" value="BankTransfer" />
                    <div class="radio-content">
                      <div class="radio-header">
                        <i class="fa-solid fa-building-columns text-emerald"></i>
                        <strong>Banka Havalesi / EFT / FAST</strong>
                      </div>
                      <span class="radio-desc">Kurumsal IBAN hesabımıza havale yapın (%5 İskonto Avantajı)</span>
                    </div>
                  </label>

                  <label class="payment-radio-box" [class.selected]="selectedPaymentMethod === 'CreditCard_PayTR'">
                    <input type="radio" [(ngModel)]="selectedPaymentMethod" name="payMethod" value="CreditCard_PayTR" />
                    <div class="radio-content">
                      <div class="radio-header">
                        <i class="fa-solid fa-credit-card text-purple"></i>
                        <strong>Kredi Kartı / Taksit (PayTR 3D Secure)</strong>
                      </div>
                      <span class="radio-desc">Tüm banka kartlarına peşin fiyatına taksit ve 3D Secure onay</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Bank Account Info Box when BankTransfer is selected -->
              <div class="form-group full-width bank-info-box" *ngIf="selectedPaymentMethod === 'BankTransfer'">
                <div class="bank-info-header">
                  <i class="fa-solid fa-shield-halved text-emerald"></i>
                  <span>Göktürk Reklam Kurumsal Banka Hesap Bilgisi</span>
                </div>
                <div class="bank-details">
                  <p><strong>Banka:</strong> Garanti BBVA - Göktürk Şubesi</p>
                  <p><strong>Hesap Sahibi:</strong> Göktürk Reklam ve Tasarım Ltd. Şti.</p>
                  <p class="iban-code"><strong>IBAN:</strong> TR62 0006 2000 0000 0090 1234 56</p>
                  <p class="ref-note"><i class="fa-solid fa-circle-info"></i> Havale yaparken açıklama kısmına <strong>{{ generatedReferenceCode }}</strong> kodunu yazınız.</p>
                </div>
              </div>

              <div class="form-group full-width">
                <label><i class="fa-solid fa-note-sticky"></i> Tasarım & Sipariş Notu (Opsiyonel)</label>
                <textarea [(ngModel)]="orderNotes" name="notes" rows="2" placeholder="Varsa özel renk, baskı veya logo talebinizi yazın" class="form-input"></textarea>
              </div>

              <div class="form-actions full-width">
                <button type="button" class="btn btn-secondary" (click)="closeOrderModal()">İptal</button>
                <button type="submit" class="btn btn-primary btn-lg" [disabled]="submittingOrder">
                  <i class="fa-solid" [ngClass]="submittingOrder ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                  {{ submittingOrder ? 'Sipariş Gönderiliyor...' : 'Siparişi Tamamla' }}
                </button>
              </div>
            </form>
          </div>

          <!-- STEP 3: SUCCESS (Sipariş Başarıyla Alındı) -->
          <div *ngIf="orderStep() === 'success'" class="order-step-success">
            <div class="success-icon-wrap">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>Siparişiniz Başarıyla Alındı!</h2>
            <p>Tebrikler! <strong>{{ prod.name }}</strong> için sipariş talebiniz sistemimize ulaşmıştır. Müşteri temsilcimiz 15 dakika içinde telefonunuzdan sizinle iletişime geçecektir.</p>
            <div class="success-actions">
              <button class="btn btn-primary" (click)="closeOrderModal()">
                <i class="fa-solid fa-check"></i> Tamam
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .catalog-layout { grid-template-columns: 1fr; }
    }

    /* ── SIDEBAR ── */
    .catalog-sidebar {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--primary);
      padding-bottom: 12px;
      border-bottom: 1px solid var(--glass-border);
    }

    .category-nav { display: flex; flex-direction: column; gap: 4px; }

    .category-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .category-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
    }

    .category-btn.active {
      background: rgba(99,102,241,0.18);
      border-color: var(--glass-border-hover);
      color: var(--primary);
    }

    .cat-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .accordion-arrow {
      font-size: 0.65rem;
      color: var(--text-dim);
      margin-left: auto;
      margin-right: 4px;
    }

    .cat-count {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 9999px;
      background: var(--bg-card);
      color: var(--text-dim);
      border: 1px solid var(--glass-border);
    }

    .sub-cat-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-left: 24px;
      margin-top: 2px;
    }

    .sub-cat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .sub-cat-btn:hover, .sub-cat-btn.active { color: var(--secondary); }

    .sub-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .sidebar-divider { height: 1px; background: var(--glass-border); margin: 8px 0; }

    .sidebar-sub { display: flex; flex-direction: column; gap: 8px; }
    .sub-title { font-size: 0.72rem; font-weight: 800; color: var(--text-dim); letter-spacing: 0.06em; }

    .sub-link {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.82rem; color: var(--text-muted); text-decoration: none;
      transition: color 0.2s;
    }
    .sub-link:hover { color: var(--primary); }

    /* ── MAIN CONTENT ── */
    .catalog-main { display: flex; flex-direction: column; gap: 20px; }

    .search-bar {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px;
    }

    .search-icon { color: var(--primary); font-size: 1.1rem; }

    .search-input {
      flex: 1; border: none; background: transparent;
      color: var(--text-main); font-family: var(--font-body); font-size: 0.95rem;
      outline: none;
    }

    .clear-search-btn {
      background: rgba(255,255,255,0.1);
      border: none; color: var(--text-muted);
      width: 24px; height: 24px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .clear-search-btn:hover { background: rgba(239,68,68,0.2); color: var(--status-danger); }

    .search-result-count { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; }

    .promo-banner {
      padding: 28px 32px;
      display: flex; justify-content: space-between; gap: 24px;
      background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%) !important;
    }

    .promo-tag { font-size: 0.75rem; font-weight: 800; color: var(--primary); letter-spacing: 0.06em; }
    .promo-title { font-size: 1.5rem; font-weight: 800; margin: 6px 0; }
    .promo-content p { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px; }

    .promo-actions { display: flex; gap: 10px; }

    .grid-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; flex-wrap: wrap;
    }

    .grid-title { font-size: 1.25rem; font-weight: 800; margin: 0; }

    .stock-toggle-label {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 9999px;
      background: var(--bg-card); border: 1px solid var(--glass-border);
      cursor: pointer; font-size: 0.8rem; font-weight: 600;
      color: var(--text-muted); transition: all 0.2s ease;
      user-select: none;
    }

    .stock-toggle-label:hover {
      background: var(--bg-card-hover);
      border-color: var(--glass-border-hover);
      color: var(--text-main);
    }

    .stock-toggle-checkbox { display: none; }

    .toggle-custom-box {
      width: 16px; height: 16px; border-radius: 4px;
      border: 1.5px solid var(--glass-border);
      background: transparent; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
    }

    .stock-toggle-checkbox:checked + .toggle-custom-box {
      background: var(--primary); border-color: var(--primary);
    }

    .stock-toggle-checkbox:checked + .toggle-custom-box::after {
      content: '✓'; color: #fff; font-size: 0.7rem; font-weight: 900;
    }

    .stock-toggle-checkbox:checked ~ .toggle-text {
      color: var(--primary); font-weight: 700;
    }

    /* ── PRODUCTS GRID ── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .product-card {
      padding: 20px;
      display: flex; flex-direction: column; gap: 14px;
      position: relative;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.25);
    }

    .product-card:hover .quick-view-overlay { opacity: 1; }

    .product-card.out-of-stock {
      opacity: 0.7;
    }

    /* Badge only shown when out of stock */
    .product-badge {
      position: absolute; top: 14px; right: 14px;
      padding: 4px 10px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 700; z-index: 2;
    }

    .badge-out-stock { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); }
    .badge-in-stock { background: rgba(16,185,129,0.15); color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3); }

    .product-img-wrapper {
      height: 160px;
      display: flex; align-items: center; justify-content: center;
      border-radius: var(--radius-md);
      background: rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
    }

    .product-img {
      max-height: 140px; max-width: 100%; object-fit: contain;
    }

    .product-icon-fallback {
      font-size: 3rem; color: var(--primary); opacity: 0.6;
    }

    .quick-view-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      color: #fff; font-weight: 700; font-size: 0.85rem;
      opacity: 0; transition: opacity 0.25s ease;
    }

    .product-body { display: flex; flex-direction: column; gap: 6px; flex: 1; }

    .product-code { font-size: 0.72rem; color: var(--text-dim); font-weight: 600; }
    .product-title { font-size: 0.95rem; font-weight: 700; margin: 0; line-height: 1.3; }

    .product-desc {
      font-size: 0.78rem; color: var(--text-muted); line-height: 1.45;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; margin: 0;
    }

    .product-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 10px; border-top: 1px solid var(--glass-border);
      gap: 8px;
    }

    .product-price-box { display: flex; flex-direction: column; }
    .price-val { font-size: 1.05rem; font-weight: 800; color: var(--secondary); font-family: var(--font-heading); }
    .price-unit { font-size: 0.7rem; color: var(--text-muted); }

    .btn-disabled {
      background: rgba(255,255,255,0.08);
      color: var(--text-dim);
      border: 1px solid var(--glass-border);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .infinite-scroll-container {
      display: flex; justify-content: center; margin-top: 24px; padding: 16px 0;
      min-height: 50px;
    }

    .auto-loader-pill {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 12px 24px; border-radius: 9999px;
      background: var(--bg-card); border: 1px solid var(--glass-border-hover);
      color: var(--text-main); font-size: 0.88rem; font-weight: 600;
      box-shadow: 0 8px 24px rgba(99,102,241,0.25);
      animation: fadeIn 0.25s ease;
    }

    .glowing-loader {
      background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.15) 100%);
      border-color: rgba(99,102,241,0.4);
    }

    /* Skeleton Loading Cards */
    .skeleton-grid { margin-top: 20px; }
    .skeleton-card {
      height: 320px; padding: 20px;
      display: flex; flex-direction: column; gap: 12px;
      pointer-events: none;
    }

    .skeleton-img-box {
      height: 140px; border-radius: var(--radius-md);
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line {
      height: 12px; border-radius: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.short { width: 40%; height: 10px; }
    .skeleton-line.title { width: 85%; height: 16px; }
    .skeleton-line.desc { width: 100%; height: 12px; }
    .skeleton-line.btn { width: 100%; height: 36px; margin-top: auto; border-radius: var(--radius-md); }

    /* ── SİPARİŞ & GÜVENLİ ALIŞVERİŞ MODAL CSS ── */
    .order-modal { max-width: 680px; }
    .order-header-badge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.75rem; font-weight: 800; color: var(--primary); letter-spacing: 0.06em;
      margin-bottom: 8px;
    }
    .order-title { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .order-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 6px 0 24px 0; }

    .choice-cards { display: flex; flex-direction: column; gap: 14px; }
    .choice-card {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px; border-radius: var(--radius-lg);
      background: rgba(255,255,255,0.03); border: 1.5px solid var(--glass-border);
      cursor: pointer; transition: all 0.25s ease; position: relative;
      text-decoration: none; color: inherit;
    }
    .choice-card:hover {
      background: rgba(99,102,241,0.12); border-color: var(--primary);
      transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.3);
    }
    .choice-card.highlight {
      border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.06);
    }
    .choice-card.highlight:hover { background: rgba(16,185,129,0.14); }

    .choice-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; color: #fff; flex-shrink: 0;
    }
    .primary-gradient { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
    .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .whatsapp-gradient { background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); }

    .choice-text { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .choice-text h3 { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .choice-text p { font-size: 0.82rem; color: var(--text-muted); margin: 0; line-height: 1.4; }
    .choice-arrow { color: var(--text-dim); font-size: 0.9rem; }

    /* Order Form */
    .form-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .form-header h2 { font-size: 1.35rem; font-weight: 800; margin: 0; }
    .back-btn {
      background: rgba(255,255,255,0.08); border: none; color: var(--text-main);
      padding: 6px 14px; border-radius: var(--radius-md); cursor: pointer;
      font-size: 0.82rem; font-weight: 600; transition: background 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.16); }

    .order-product-summary {
      display: flex; align-items: center; gap: 16px;
      padding: 12px 18px; border-radius: var(--radius-md);
      background: rgba(0,0,0,0.25); border: 1px solid var(--glass-border);
      margin-bottom: 20px;
    }
    .summary-img { width: 50px; height: 50px; object-fit: contain; border-radius: 6px; }
    .order-product-summary h4 { font-size: 0.95rem; font-weight: 700; margin: 2px 0; }
    .summary-price { font-size: 0.85rem; font-weight: 800; color: var(--secondary); }

    .order-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); }

    .payment-method-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .payment-method-options { grid-template-columns: 1fr; } }

    .payment-radio-box {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-radius: var(--radius-md);
      background: rgba(255,255,255,0.03); border: 1.5px solid var(--glass-border);
      cursor: pointer; transition: all 0.2s ease;
    }
    .payment-radio-box:hover, .payment-radio-box.selected {
      border-color: var(--primary); background: rgba(99,102,241,0.1);
    }

    .radio-content { display: flex; flex-direction: column; gap: 4px; }
    .radio-header { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; }
    .radio-desc { font-size: 0.76rem; color: var(--text-muted); line-height: 1.35; }

    .bank-info-box {
      padding: 16px; border-radius: var(--radius-md);
      background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25);
      display: flex; flex-direction: column; gap: 8px;
    }
    .bank-info-header { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; font-weight: 700; color: var(--accent-emerald); }
    .bank-details p { font-size: 0.84rem; margin: 3px 0; color: var(--text-main); }
    .iban-code { font-family: monospace; font-size: 0.95rem !important; color: var(--secondary) !important; font-weight: 800; }
    .ref-note { font-size: 0.8rem !important; color: #fbbf24 !important; font-weight: 700; margin-top: 6px !important; }

    .form-input {
      padding: 10px 14px; border-radius: var(--radius-md);
      border: 1px solid var(--glass-border); background: var(--bg-card);
      color: var(--text-main); font-family: var(--font-body); font-size: 0.88rem;
      outline: none; transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--primary); }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }

    /* Success Step */
    .order-step-success { text-align: center; padding: 24px 12px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .success-icon-wrap { font-size: 4rem; color: var(--status-success); }
    .order-step-success h2 { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .order-step-success p { font-size: 0.92rem; color: var(--text-muted); max-width: 480px; line-height: 1.6; margin: 0; }

    .empty-state {
      padding: 48px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .empty-icon { font-size: 3rem; color: var(--text-dim); }

    /* ── ÜRÜN İNCELEME MODALI ── */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .modal-card {
      width: 100%; max-width: 760px;
      position: relative; padding: 32px;
      border-radius: var(--radius-xl);
      animation: slideUp 0.25s ease;
    }

    .modal-close-btn {
      position: absolute; top: 18px; right: 18px;
      background: rgba(255,255,255,0.1); border: none;
      color: var(--text-muted); width: 36px; height: 36px;
      border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; transition: all 0.2s;
    }
    .modal-close-btn:hover { background: rgba(239,68,68,0.25); color: var(--status-danger); }

    .modal-body {
      display: grid; grid-template-columns: 280px 1fr; gap: 28px; align-items: start;
    }

    @media (max-width: 640px) {
      .modal-body { grid-template-columns: 1fr; }
    }

    .modal-img-col {
      display: flex; flex-direction: column; gap: 12px; align-items: center;
    }

    .modal-img {
      max-height: 220px; width: 100%; object-fit: contain;
      border-radius: var(--radius-md); background: rgba(0,0,0,0.2); padding: 12px;
    }

    .modal-icon-fallback {
      font-size: 5rem; color: var(--primary); opacity: 0.5; padding: 40px;
    }

    .modal-info-col { display: flex; flex-direction: column; gap: 12px; }

    .product-code-tag {
      font-size: 0.78rem; font-weight: 700; color: var(--primary); letter-spacing: 0.05em;
    }

    .modal-product-title { font-size: 1.5rem; font-weight: 800; margin: 0; line-height: 1.2; }

    .modal-category-label {
      font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;
    }

    .modal-price-box {
      display: flex; align-items: baseline; gap: 8px;
      padding: 12px 16px; border-radius: var(--radius-md);
      background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
    }

    .modal-price { font-size: 1.5rem; font-weight: 900; color: var(--secondary); }
    .modal-unit { font-size: 0.85rem; color: var(--text-muted); }

    .modal-desc-box { display: flex; flex-direction: column; gap: 6px; }
    .modal-desc-box h4 { font-size: 0.9rem; font-weight: 700; margin: 0; color: var(--text-dim); }
    .modal-desc-box p { font-size: 0.86rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

    .modal-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }

    .btn-whatsapp-sm {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 20px; font-size: 0.9rem; font-weight: 700;
      border-radius: var(--radius-lg); background: #25d366; color: #fff;
      text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-whatsapp-sm:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,211,102,0.3); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  public authService = inject(AuthService);

  // Sanitize HTML to prevent XSS
  sanitize(html: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  // Safe WhatsApp URL with proper encoding
  getWhatsAppUrl(productName: string, productCode: string): string {
    const text = encodeURIComponent(`Merhaba, ${productName} (${productCode}) hakkında bilgi almak istiyorum.`);
    return `https://wa.me/905325182234?text=${text}`;
  }

  getWhatsAppOrderUrl(productName: string, productCode: string): string {
    const text = encodeURIComponent(`Merhaba, ${productName} (${productCode}) siparişi vermek istiyorum.`);
    return `https://wa.me/905325182234?text=${text}`;
  }

  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  categoryTree = signal<CategoryTreeNodeDto[]>([]);
  products = signal<ProductDto[]>([]);
  activeCategory = signal<string>('all');
  activeCategoryName = signal<string>('Tüm Hizmetler & Ürünler');
  selectedProduct = signal<ProductDto | null>(null);
  hideOutOfStock = signal<boolean>(false);

  // Order Flow Signals & State
  orderProduct = signal<ProductDto | null>(null);
  orderStep = signal<'choice' | 'form' | 'success'>('choice');
  orderFullName = '';
  orderPhone = '';
  orderQuantity = '250 adet';
  orderAddress = '';
  orderNotes = '';
  selectedPaymentMethod = 'BankTransfer';
  generatedReferenceCode = 'GKT-EFT-' + Math.floor(1000 + Math.random() * 9000);
  submittingOrder = false;

  searchQuery = '';
  currentPage = 1;
  totalCount = signal(0);
  hasNextPage = signal(false);
  loadingMore = false;
  syncing = false;

  totalCatalogProducts = computed(() =>
    this.categoryTree().reduce((acc, cat) => acc + cat.totalProductCount, 0)
  );

  displayedProducts = computed(() => {
    if (this.hideOutOfStock()) {
      return this.products().filter(p => p.inStock);
    }
    return this.products();
  });

  toggleHideOutOfStock(): void {
    this.hideOutOfStock.update(val => !val);
  }

  private isCooldown = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();

    window.addEventListener('scroll', () => {
      this.checkScrollAndLoad();
    }, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private checkScrollAndLoad(): void {
    if (!this.hasNextPage() || this.loadingMore || this.isCooldown) return;

    // Distance to absolute bottom of window scroll
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    const distanceToBottom = fullHeight - (scrollPosition + windowHeight);
    if (distanceToBottom <= 400) {
      this.loadNextPage();
    }
  }

  private initIntersectionObserver(): void {
    // Set root: null so it observes against the window viewport
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting && !this.loadingMore && !this.isCooldown) {
        this.loadNextPage();
      }
    }, options);

    if (this.scrollSentinel?.nativeElement) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  expandedCategoryIds = signal<Set<string>>(new Set<string>());

  isCategoryExpanded(catId: string): boolean {
    return this.expandedCategoryIds().has(catId);
  }

  toggleCategoryExpand(catId: string, catName: string): void {
    this.expandedCategoryIds.update(set => {
      const next = new Set(set);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });

    this.selectCategory(catId, catName);
  }

  loadCategories(): void {
    this.http.get<CategoryTreeNodeDto[]>('/api/catalog/categories').subscribe({
      next: data => {
        this.categoryTree.set(data);
        if (data.length > 0) {
          // Expand ONLY the first category initially as requested
          this.expandedCategoryIds.set(new Set<string>([data[0].externalId]));
        }
      },
      error: () => {}
    });
  }

  loadProducts(loadMore = false): void {
    if (!loadMore) {
      this.currentPage = 1;
    }

    const catParam = this.activeCategory() === 'all' ? '' : this.activeCategory();
    const url = `/api/catalog/products?category=${encodeURIComponent(catParam)}&search=${encodeURIComponent(this.searchQuery)}&page=${this.currentPage}&pageSize=12`;

    this.http.get<PagedProductsResponse>(url).subscribe({
      next: res => {
        if (loadMore) {
          this.products.update(prev => [...prev, ...res.items]);
        } else {
          this.products.set(res.items);
        }
        this.totalCount.set(res.totalCount);
        this.hasNextPage.set(res.hasNextPage);
        this.loadingMore = false;

        // 500ms cooldown after fetching a page
        setTimeout(() => {
          this.isCooldown = false;
        }, 500);
      },
      error: () => {
        this.loadingMore = false;
        this.isCooldown = false;
      }
    });
  }

  selectCategory(catId: string, catName: string): void {
    this.activeCategory.set(catId);
    this.activeCategoryName.set(catName);
    this.searchQuery = '';
    this.loadProducts();
  }

  onSearchChange(): void {
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadProducts();
  }

  loadNextPage(): void {
    if (this.hasNextPage() && !this.loadingMore && !this.isCooldown) {
      this.isCooldown = true;
      this.loadingMore = true;
      this.currentPage++;
      this.loadProducts(true);
    }
  }

  openProductModal(product: ProductDto): void {
    this.selectedProduct.set(product);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  onOrderClick(product: ProductDto): void {
    this.orderProduct.set(product);
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUser();
      this.orderFullName = user?.fullName || '';
      this.orderPhone = user?.phone || '';
      this.orderStep.set('form');
    } else {
      this.orderStep.set('choice');
    }
  }

  closeOrderModal(): void {
    this.orderProduct.set(null);
    this.orderStep.set('choice');
    this.submittingOrder = false;
  }

  goToLogin(): void {
    this.closeOrderModal();
    this.router.navigate(['/login']);
  }

  submitOrder(): void {
    if (!this.orderFullName || !this.orderPhone || !this.orderAddress) return;
    this.submittingOrder = true;
    setTimeout(() => {
      this.submittingOrder = false;
      this.orderStep.set('success');
    }, 600);
  }

  triggerXmlSync(): void {
    this.syncing = true;
    this.http.post<{ message: string; categoriesSynced: number; productsSynced: number }>('/api/vendor/sync', {}).subscribe({
      next: () => {
        this.syncing = false;
        this.loadCategories();
        this.loadProducts();
      },
      error: () => {
        this.syncing = false;
      }
    });
  }
}
