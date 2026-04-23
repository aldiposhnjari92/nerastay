import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withComputed, withMethods, withHooks } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { UserProfile, UserRole } from '@nerastay/shared';
import { FirebaseAuthService, FirebaseUser } from '@nerastay/shared';
import { UserProfileService } from '../user-profile.service';
import { parseHttpError } from '@nerastay/shared';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  initialized: false
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(store => ({
    isLoggedIn: computed(() => store.user() !== null),
    isOwner: computed(() => {
      const role = store.user()?.role;
      return role === 'owner' || role === 'admin';
    }),
    isAdmin: computed(() => store.user()?.role === 'admin'),
    isGuest: computed(() => store.user() === null || store.user()?.role === 'guest'),
    displayName: computed(() => store.user()?.displayName ?? 'Guest'),
    photoURL: computed(() => store.user()?.photoURL ?? null),
    uid: computed(() => store.user()?.uid ?? null)
  })),
  withMethods((store, authService = inject(FirebaseAuthService), profileService = inject(UserProfileService), router = inject(Router)) => ({
    async initializeAuth(): Promise<void> {
      authService.currentUser$.subscribe(async firebaseUser => {
        if (firebaseUser) {
          patchState(store, { firebaseUser, loading: true });
          const profile = await profileService.getProfile(firebaseUser.uid);
          patchState(store, { user: profile, loading: false, initialized: true });
        } else {
          patchState(store, { firebaseUser: null, user: null, loading: false, initialized: true });
        }
      });
    },

    async signInWithEmail(email: string, password: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const fbUser = await authService.signInWithEmailPassword(email, password);
        const profile = await profileService.getProfile(fbUser.uid);
        patchState(store, { firebaseUser: fbUser, user: profile, loading: false });
        router.navigate(['/']);
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async signInWithGoogle(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const fbUser = await authService.signInWithGoogle();
        let profile = await profileService.getProfile(fbUser.uid);
        if (!profile) {
          profile = await profileService.createProfile(fbUser.uid, {
            uid: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: fbUser.displayName ?? 'User',
            photoURL: fbUser.photoURL ?? undefined,
            role: 'guest',
            favoriteListingIds: [],
            createdAt: new Date()
          });
        }
        patchState(store, { firebaseUser: fbUser, user: profile, loading: false });
        router.navigate(['/']);
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async register(email: string, password: string, displayName: string, role: UserRole = 'guest'): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const fbUser = await authService.createUserWithEmailPassword(email, password, displayName);
        const profile = await profileService.createProfile(fbUser.uid, {
          uid: fbUser.uid,
          email,
          displayName,
          role,
          favoriteListingIds: [],
          createdAt: new Date()
        });
        patchState(store, { firebaseUser: fbUser, user: profile, loading: false });
        router.navigate([role === 'owner' ? '/listings/new' : '/']);
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async signOut(): Promise<void> {
      await authService.signOut();
      patchState(store, { user: null, firebaseUser: null });
      router.navigate(['/auth/login']);
    },

    async toggleFavorite(listingId: string): Promise<void> {
      const user = store.user();
      if (!user) return;
      const isFav = user.favoriteListingIds.includes(listingId);
      const updated = isFav
        ? user.favoriteListingIds.filter(id => id !== listingId)
        : [...user.favoriteListingIds, listingId];
      await profileService.updateProfile(user.uid, { favoriteListingIds: updated });
      patchState(store, { user: { ...user, favoriteListingIds: updated } });
    },

    clearError(): void {
      patchState(store, { error: null });
    }
  })),
  withHooks({
    onInit(store) {
      store.initializeAuth();
    }
  })
);
