import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnChanges {
  @Input() productToEdit: Product | null = null;
  @Input() isExpanded = false;
  @Output() expandForm = new EventEmitter<void>();
  @Output() collapseForm = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  formProduct: Product = this.getEmptyProduct();
  errorMessage = '';

  constructor(private api: Api) {}

  @HostListener('window:scroll')
  handleWindowScroll(): void {
    if (this.isExpanded && this.isDefaultProduct()) {
      this.collapseForm.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productToEdit']) {
      this.formProduct = this.productToEdit ? { ...this.productToEdit } : this.getEmptyProduct();
      this.errorMessage = '';

      if (this.productToEdit) {
        this.expandForm.emit();
      }
    }
  }

  openForm(): void {
    this.expandForm.emit();
  }

  saveProduct(): void {
    if (this.formProduct._id) {
      this.api.updateProduct(this.formProduct._id, this.formProduct).subscribe({
        next: () => {
          this.resetForm();
          this.productSaved.emit();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update product';
        }
      });

      return;
    }

    this.api.createProduct(this.formProduct).subscribe({
      next: () => {
        this.resetForm();
        this.productSaved.emit();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create product';
      }
    });
  }

  resetForm(): void {
    this.formProduct = this.getEmptyProduct();
    this.errorMessage = '';
  }

  cancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  private isDefaultProduct(): boolean {
    return (
      !this.formProduct._id &&
      this.formProduct.title.trim() === '' &&
      this.formProduct.description.trim() === '' &&
      Number(this.formProduct.price) === 0 &&
      Number(this.formProduct.quantityInStock) === 0
    );
  }

  private getEmptyProduct(): Product {
    return {
      title: '',
      description: '',
      price: 0,
      quantityInStock: 0
    };
  }
}
