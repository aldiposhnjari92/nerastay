import { Routes } from '@angular/router';
import { adminGuard } from '@nerastay/auth';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'listings',
    loadComponent: () => import('./pages/listing-moderation/listing-moderation.component').then(m => m.ListingModerationComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'reviews',
    loadComponent: () => import('./pages/review-moderation/review-moderation.component').then(m => m.ReviewModerationComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [adminGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
