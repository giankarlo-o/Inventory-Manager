import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Api } from '../../services/api';
import { Product } from '../../models/product';
import { ProductForm } from '../product-form/product-form';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ProductForm],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css'
})
export class InventoryList implements OnInit {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  productPendingDelete: Product | null = null;
  isProductFormExpanded = false;
  errorMessage = '';

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load products';
      }
    });
  }

  expandProductForm(): void {
    this.isProductFormExpanded = true;
  }

  collapseProductForm(): void {
    this.isProductFormExpanded = false;
  }

  selectProduct(product: Product): void {
    this.selectedProduct = { ...product };
    this.expandProductForm();
  }

  clearSelection(): void {
    this.selectedProduct = null;
    this.collapseProductForm();
  }

  confirmDelete(product: Product): void {
    this.productPendingDelete = product;
  }

  cancelDelete(): void {
    this.productPendingDelete = null;
  }

  handleProductSaved(): void {
    this.loadProducts();
    this.clearSelection();
  }

  deleteProduct(id: string | undefined): void {
    if (!id) {
      return;
    }

    this.api.deleteProduct(id).subscribe({
      next: () => {
        this.productPendingDelete = null;
        this.loadProducts();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete product';
      }
    });
  }
}
