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

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<CartItem[]>([]);
  isOpen = signal<boolean>(false);

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
      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...currentItems, {
          id: product.id,
          productCode: product.productCode,
          name: product.name,
          basePrice: product.basePrice > 0 ? product.basePrice : 450, // Varsayılan paket fiyatı
          unit: product.unit || 'paket',
          quantity: 1,
          imageUrl: product.imageUrl
        }];
      }
    });

    this.openDrawer();
  }

  updateQuantity(id: string, delta: number): void {
    this.items.update(currentItems => {
      return currentItems.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  }

  removeItem(id: string): void {
    this.items.update(currentItems => currentItems.filter(i => i.id !== id));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
