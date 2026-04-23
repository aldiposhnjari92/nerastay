import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from './store/auth.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isLoggedIn()) return true;
  return router.createUrlTree(['/auth/login']);
};

export const ownerGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isOwner()) return true;
  if (!store.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  return router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isAdmin()) return true;
  if (!store.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  return router.createUrlTree(['/']);
};

export const guestOnlyGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (!store.isLoggedIn()) return true;
  return router.createUrlTree(['/']);
};
