import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Product } from '../models/product';
import { CreateTransactionRequest, Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly productApiUrl = 'http://localhost:3000/api/products';
  private readonly transactionApiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(this.productApiUrl);
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.productApiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.productApiUrl, product);
  }

  updateProduct(id: string, product: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.productApiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.delete<ApiResponse<Product>>(`${this.productApiUrl}/${id}`);
  }

  createTransaction(transaction: CreateTransactionRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.transactionApiUrl, transaction);
  }

  getTransactions(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(this.transactionApiUrl);
  }
}
