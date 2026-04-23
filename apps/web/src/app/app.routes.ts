import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'listings',
    loadChildren: () => import('@nerastay/listings').then(m => m.LISTINGS_ROUTES)
  },
  {
    path: 'bookings',
    loadChildren: () => import('@nerastay/booking').then(m => m.BOOKING_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('@nerastay/auth').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'profile',
    loadComponent: () => import('@nerastay/auth').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
