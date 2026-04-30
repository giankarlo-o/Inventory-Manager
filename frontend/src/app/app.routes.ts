import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { InventoryList } from './components/inventory-list/inventory-list';
import { Checkout } from './components/checkout/checkout';
import { Transactions } from './components/transactions/transactions';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
  {
    path: 'inventory',
    component: InventoryList
  },
  {
    path: 'checkout',
    component: Checkout
  },
  {
    path: 'transactions',
    component: Transactions
  },
  {
    path: '**',
    redirectTo: ''
  }
];
