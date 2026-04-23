import { Routes } from '@angular/router';
import { authGuard, ownerGuard } from '@nerastay/auth';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/booking-calendar/booking-calendar.component').then(m => m.BookingCalendarComponent),
    canActivate: [ownerGuard]
  },
  {
    path: ':id/confirmation',
    loadComponent: () => import('./components/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
    canActivate: [authGuard]
  }
];
