import { Injectable } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class Cart {
  private readonly storageKey = 'inventory-manager-cart';

  getItems(): CartItem[] {
    const savedCart = localStorage.getItem(this.storageKey);

    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      this.clearCart();
      return [];
    }
  }

  saveItems(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }
}
