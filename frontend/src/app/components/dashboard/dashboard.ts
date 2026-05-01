import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Product } from '../../models/product';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  lowInventoryThreshold = 5;

  products: Product[] = [];
  lowInventoryProducts: Product[] = [];

  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];

  completedTransactionsToday = 0;
  totalEarningsToday = 0;

  errorMessage = '';

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.api.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.lowInventoryProducts = this.products.filter((product) => {
          return product.quantityInStock <= this.lowInventoryThreshold;
        });

        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load dashboard data';
      }
    });

    this.api.getTransactions().subscribe({
      next: (response) => {
        this.transactions = response.data;

        const today = new Date();

        const transactionsToday = this.transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.transactionDate);

          return (
            transactionDate.getFullYear() === today.getFullYear() &&
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getDate() === today.getDate()
          );
        });

        this.recentTransactions = transactionsToday
          .sort((firstTransaction, secondTransaction) => {
            return (
              new Date(secondTransaction.transactionDate).getTime() -
              new Date(firstTransaction.transactionDate).getTime()
            );
          })
          .slice(0, 5);

        this.completedTransactionsToday = transactionsToday.length;
        this.totalEarningsToday = transactionsToday.reduce((total, transaction) => {
          return total + transaction.totalAmount;
        }, 0);

        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load transactions';
      }
    });
  }

  getTransactionItemCount(transaction: Transaction): number {
    return transaction.items.reduce((total, item) => {
      return total + item.quantityPurchased;
    }, 0);
  }
}
