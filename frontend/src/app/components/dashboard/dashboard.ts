import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Product } from '../../models/product';

interface TransactionSummary {
  id: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  completedAt: string;
}

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

  completedTransactionsToday = 0;
  totalEarningsToday = 0;

  recentTransactions: TransactionSummary[] = [
    {
      id: 'TXN-1005',
      customerName: 'Walk-in Customer',
      itemCount: 3,
      totalAmount: 38.47,
      completedAt: new Date().toISOString()
    },
    {
      id: 'TXN-1004',
      customerName: 'Walk-in Customer',
      itemCount: 1,
      totalAmount: 12.99,
      completedAt: new Date().toISOString()
    },
    {
      id: 'TXN-1003',
      customerName: 'Walk-in Customer',
      itemCount: 4,
      totalAmount: 64.25,
      completedAt: new Date().toISOString()
    },
    {
      id: 'TXN-1002',
      customerName: 'Walk-in Customer',
      itemCount: 2,
      totalAmount: 21.5,
      completedAt: new Date().toISOString()
    },
    {
      id: 'TXN-1001',
      customerName: 'Walk-in Customer',
      itemCount: 5,
      totalAmount: 97.75,
      completedAt: new Date().toISOString()
    }
  ];

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

        this.completedTransactionsToday = this.recentTransactions.length;
        this.totalEarningsToday = this.recentTransactions.reduce((total, transaction) => {
          return total + transaction.totalAmount;
        }, 0);

        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load dashboard data';
      }
    });
  }
}
