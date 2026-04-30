import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { InventoryList } from './components/inventory-list/inventory-list';

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
    path: '**',
    redirectTo: ''
  }
];
