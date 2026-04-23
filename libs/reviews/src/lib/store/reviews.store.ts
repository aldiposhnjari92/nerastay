import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Review, ReviewFormData } from '@nerastay/shared';
import { ReviewsService } from '../services/reviews.service';
import { AuthStore } from '@nerastay/auth';

interface ReviewsState {
  reviews: Review[];
  currentListingId: string | null;
  hasMore: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  lastDocRef: unknown;
}

const initialState: ReviewsState = {
  reviews: [],
  currentListingId: null,
  hasMore: true,
  loading: false,
  submitting: false,
  error: null,
  lastDocRef: null
};

export const ReviewsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    averageRating: computed(() => {
      const reviews = store.reviews();
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return Math.round((sum / reviews.length) * 10) / 10;
    }),
    ratingDistribution: computed(() => {
      const reviews = store.reviews();
      const dist = [0, 0, 0, 0, 0];
      for (const r of reviews) dist[r.rating - 1]++;
      return dist;
    })
  })),
  withMethods(store => {
    const reviewsService = inject(ReviewsService);
    const authStore = inject(AuthStore);

    return {
      async loadReviews(listingId: string, reset = false): Promise<void> {
        if (reset) {
          patchState(store, { reviews: [], lastDocRef: null, hasMore: true, currentListingId: listingId });
        }
        if (!store.hasMore()) return;
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(
            reviewsService.getReviews(listingId, 10, store.lastDocRef() as never)
          );
          patchState(store, {
            reviews: reset ? result.reviews : [...store.reviews(), ...result.reviews],
            lastDocRef: result.lastDoc,
            hasMore: result.lastDoc !== null,
            loading: false
          });
        } catch (e: unknown) {
          patchState(store, { error: String(e), loading: false });
        }
      },

      async submitReview(data: ReviewFormData): Promise<boolean> {
        const user = authStore.user();
        if (!user) { patchState(store, { error: 'You must be logged in to review.' }); return false; }
        patchState(store, { submitting: true, error: null });
        try {
          await reviewsService.createReview({
            ...data,
            authorId: user.uid,
            authorName: user.displayName,
            authorPhoto: user.photoURL ?? null
          });
          patchState(store, { submitting: false });
          if (store.currentListingId()) {
            await this.loadReviews(store.currentListingId()!, true);
          }
          return true;
        } catch (e: unknown) {
          patchState(store, { error: String(e), submitting: false });
          return false;
        }
      },

      async addOwnerReply(listingId: string, reviewId: string, reply: string): Promise<void> {
        patchState(store, { submitting: true });
        try {
          await reviewsService.addOwnerReply(listingId, reviewId, reply);
          patchState(store, {
            reviews: store.reviews().map(r =>
              r.id === reviewId ? { ...r, ownerReply: reply, ownerRepliedAt: new Date() } : r
            ),
            submitting: false
          });
        } catch (e: unknown) {
          patchState(store, { error: String(e), submitting: false });
        }
      },

      clearError(): void { patchState(store, { error: null }); }
    };
  })
);
