import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { Checkout } from './checkout';
import { Api } from '../../services/api';
import { Cart } from '../../services/cart';
import { Product } from '../../models/product';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;

  const apiMock = {
    getProducts: vi.fn()
  };

  const cartMock = {
    getItems: vi.fn(),
    saveItems: vi.fn(),
    clearCart: vi.fn()
  };

  const mockProducts: Product[] = [
    {
      _id: '1',
      title: 'Coffee',
      description: 'Ground coffee beans',
      price: 12.99,
      quantityInStock: 5
    },
    {
      _id: '2',
      title: 'Tea',
      description: 'Green tea bags',
      price: 6.5,
      quantityInStock: 10
    },
    {
      _id: '3',
      title: 'Out of Stock Mug',
      description: 'Ceramic mug',
      price: 8,
      quantityInStock: 0
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    apiMock.getProducts.mockReturnValue(
      of({
        success: true,
        data: mockProducts
      })
    );

    cartMock.getItems.mockReturnValue([]);

    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        {
          provide: Api,
          useValue: apiMock
        },
        {
          provide: Cart,
          useValue: cartMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
