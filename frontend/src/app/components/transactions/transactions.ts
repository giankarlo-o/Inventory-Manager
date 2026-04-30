import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api, Transaction } from '../../services/api';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  transactions: Transaction[] = [];
  expandedTransactionIds = new Set<string>();
  errorMessage = '';

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  get totalTransactionAmount(): number {
    return this.transactions.reduce((total, transaction) => {
      return total + transaction.totalAmount;
    }, 0);
  }

  get totalItemsSold(): number {
    return this.transactions.reduce((transactionTotal, transaction) => {
      return (
        transactionTotal +
        transaction.items.reduce((itemTotal, item) => {
          return itemTotal + item.quantityPurchased;
        }, 0)
      );
    }, 0);
  }

  loadTransactions(): void {
    this.api.getTransactions().subscribe({
      next: (response) => {
        this.transactions = response.data;
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

  isExpanded(transaction: Transaction): boolean {
    if (!transaction._id) {
      return false;
    }

    return this.expandedTransactionIds.has(transaction._id);
  }

  toggleTransaction(transaction: Transaction): void {
    if (!transaction._id) {
      return;
    }

    if (this.expandedTransactionIds.has(transaction._id)) {
      this.expandedTransactionIds.delete(transaction._id);
    } else {
      this.expandedTransactionIds.add(transaction._id);
    }
  }

  getTransactionLabel(transaction: Transaction): string {
    if (!transaction._id) {
      return 'Transaction';
    }

    return `Transaction #${transaction._id.slice(-6).toUpperCase()}`;
  }
}
