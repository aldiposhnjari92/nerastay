import { Routes } from '@angular/router';
import { ownerGuard } from '@nerastay/auth';

export const LISTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/listing-search-page.component').then(m => m.ListingSearchPageComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/listing-form/listing-form.component').then(m => m.ListingFormComponent),
    canActivate: [ownerGuard]
  },
  {
    path: 'my-listings',
    loadComponent: () => import('./components/host-listings/host-listings.component').then(m => m.HostListingsComponent),
    canActivate: [ownerGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./components/listing-detail/listing-detail.component').then(m => m.ListingDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/listing-form/listing-form.component').then(m => m.ListingFormComponent),
    canActivate: [ownerGuard]
  }
];
