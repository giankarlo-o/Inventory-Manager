import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Product } from '../../models/product';
import { Cart, CartItem } from '../../services/cart';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  products: Product[] = [];
  cartItems: CartItem[] = [];

  searchTerm = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: Api,
    private cart: Cart
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cart.getItems();
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const normalizedSearchTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return [];
    }

    return this.products
      .filter((product) => {
        const titleMatches = product.title.toLowerCase().includes(normalizedSearchTerm);
        const descriptionMatches = product.description.toLowerCase().includes(normalizedSearchTerm);
        const isInStock = product.quantityInStock > 0;

        return isInStock && (titleMatches || descriptionMatches);
      })
      .slice(0, 6);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.syncCartWithInventory();
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load products';
      }
    });
  }

  addProductToCart(product: Product): void {
    if (!product._id || product.quantityInStock <= 0) {
      return;
    }

    const existingItem = this.cartItems.find((item) => {
      return item.product._id === product._id;
    });

    if (existingItem) {
      this.updateQuantity(existingItem, existingItem.quantity + 1);
    } else {
      this.cartItems = [
        ...this.cartItems,
        {
          product,
          quantity: 1
        }
      ];

      this.saveCart();
    }

    this.searchTerm = '';
    this.successMessage = '';
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity - 1);
  }

  updateQuantity(item: CartItem, quantity: number | string): void {
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity)) {
      return;
    }

    const safeQuantity = Math.floor(parsedQuantity);

    if (safeQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    const maxQuantity = item.product.quantityInStock;
    item.quantity = Math.min(safeQuantity, maxQuantity);

    this.saveCart();
  }

  removeItem(itemToRemove: CartItem): void {
    this.cartItems = this.cartItems.filter((item) => {
      return item.product._id !== itemToRemove.product._id;
    });

    this.saveCart();
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      return;
    }

    const transaction = {
      items: this.cartItems
        .filter((item) => {
          return !!item.product._id;
        })
        .map((item) => {
          return {
            productId: item.product._id as string,
            quantityPurchased: item.quantity
          };
        }),
      transactionDate: new Date().toISOString()
    };

    this.api.createTransaction(transaction).subscribe({
      next: (response) => {
        this.cart.clearCart();
        this.cartItems = [];
        this.successMessage = response.message || 'Checkout complete. Transaction saved.';
        this.errorMessage = '';
        this.loadProducts();
      },
      error: (error) => {
        this.errorMessage =
          error.error?.error ||
          error.error?.errors?.join(', ') ||
          error.error?.message ||
          'Failed to complete checkout';
        this.successMessage = '';
        this.loadProducts();
      }
    });
  }

  private syncCartWithInventory(): void {
    this.cartItems = this.cartItems
      .map((item) => {
        const currentProduct = this.products.find((product) => {
          return product._id === item.product._id;
        });

        if (!currentProduct || currentProduct.quantityInStock <= 0) {
          return null;
        }

        return {
          product: currentProduct,
          quantity: Math.min(item.quantity, currentProduct.quantityInStock)
        };
      })
      .filter((item): item is CartItem => {
        return item !== null;
      });

    this.saveCart();
  }

  private saveCart(): void {
    this.cart.saveItems(this.cartItems);
  }
}
