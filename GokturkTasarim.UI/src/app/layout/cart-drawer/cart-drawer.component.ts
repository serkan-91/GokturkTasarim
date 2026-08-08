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
          <button class="btn btn-primary btn-lg checkout-btn" (click)="completeOrder()">
            <i class="fa-solid fa-credit-card"></i> Siparişi Tamamla
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

    <!-- ── SİPARİŞ BAŞARILI MODALI (HIZLI TAMAMLAMA) ─────────────────────────── -->
    <div class="modal-backdrop" *ngIf="orderCompleted()">
      <div class="modal-card glass-card animate-fadeIn">
        <div class="order-success-box">
          <div class="success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>Siparişiniz Başarıyla Alındı!</h3>
          <p>Sipariş detaylarınız müşteri temsilcimize iletilmiştir. Kısa süre içinde onay için tarafınızla iletişime geçilecektir.</p>
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

    /* Modal success */
    .order-success-box {
      padding: 32px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .success-icon { font-size: 3.5rem; color: var(--status-success); }
    .success-ref { padding: 10px 16px; background: rgba(16,185,129,0.1); border-radius: var(--radius-md); font-size: 0.9rem; }
  `]
})
export class CartDrawerComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);

  orderCompleted = signal(false);
  randomRefCode = Math.floor(100000 + Math.random() * 900000);

  getWhatsAppCartUrl(): string {
    const itemsText = this.cartService.items().map(i => `- ${i.name} (${i.quantity} adet) = ${(i.basePrice * i.quantity)} TL`).join('%0A');
    const total = (this.cartService.totalAmount() * 1.20).toFixed(2);
    const text = `Merhaba, aşağıdaki sepet siparişini iletmek istiyorum:%0A%0A${itemsText}%0A%0AToplam Tutar: ${total} TL`;
    return `https://wa.me/905325182234?text=${text}`;
  }

  completeOrder(): void {
    this.cartService.clearCart();
    this.cartService.closeDrawer();
    this.orderCompleted.set(true);
  }
}
