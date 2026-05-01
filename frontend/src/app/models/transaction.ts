import {Product} from './product';

export interface CreateTransactionItemRequest {
  productId: string;
  quantityPurchased: number;
}

export interface CreateTransactionRequest {
  items: CreateTransactionItemRequest[];
  transactionDate?: string;
}

export interface TransactionItem {
  product: Product;
  priceAtCheckout: number;
  quantityPurchased: number;
  itemTotal: number;
}

export interface Transaction {
  _id?: string;
  items: TransactionItem[];
  totalAmount: number;
  transactionDate: string;
  createdAt?: string;
  updatedAt?: string;
}
