import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  productCode: string;
  name: string;
  basePrice: number;
  unit: string;
  quantity: number;
  selectedOption?: string;
  imageUrl?: string;
}

const CART_STORAGE_KEY = 'gokturk_cart_items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<CartItem[]>(this.loadCartFromStorage());
  isOpen = signal<boolean>(false);

  constructor() {
    // Save to LocalStorage whenever items signal changes
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(cartItems: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Cart save error:', e);
    }
  }

  // Toplam Tutar
  totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + (item.basePrice * item.quantity), 0)
  );

  // Toplam Ürün Çeşidi Sayısı
  itemCount = computed(() => this.items().length);

  // Toplam Adet
  totalQuantity = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  toggleDrawer(): void {
    this.isOpen.update(v => !v);
  }

  openDrawer(): void {
    this.isOpen.set(true);
  }

  closeDrawer(): void {
    this.isOpen.set(false);
  }

  addItem(product: { id: string; productCode: string; name: string; basePrice: number; unit: string; imageUrl?: string }): void {
    this.items.update(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.id === product.id);
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...currentItems];
        updated[existingIndex].quantity += 1;
      } else {
        updated = [...currentItems, {
          id: product.id,
          productCode: product.productCode,
          name: product.name,
          basePrice: product.basePrice > 0 ? product.basePrice : 450,
          unit: product.unit || 'paket',
          quantity: 1,
          imageUrl: product.imageUrl
        }];
      }
      this.saveCartToStorage(updated);
      return updated;
    });

    this.openDrawer();
  }

  updateQuantity(id: string, delta: number): void {
    this.items.update(currentItems => {
      const updated = currentItems.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
      this.saveCartToStorage(updated);
      return updated;
    });
  }

  removeItem(id: string): void {
    this.items.update(currentItems => {
      const updated = currentItems.filter(i => i.id !== id);
      this.saveCartToStorage(updated);
      return updated;
    });
  }

  clearCart(): void {
    this.items.set([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  }
}
