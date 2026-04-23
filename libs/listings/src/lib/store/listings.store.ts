import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { Listing, ListingWithDistance, ListingFilters, ListingFormData, GeoSearchParams } from '@nerastay/shared';
import { ListingsService } from '../services/listings.service';
import { GeoQueryService } from '../services/geo-query.service';
import { AlgoliaService, AlgoliaFilters } from '../services/algolia.service';
import { AuthStore } from '@nerastay/auth';
import { parseHttpError } from '@nerastay/shared';
import { firstValueFrom } from 'rxjs';

interface ListingsState {
  geoResults: ListingWithDistance[];
  searchResults: Listing[];
  selectedListing: Listing | null;
  ownerListings: Listing[];
  pendingListings: Listing[];
  filters: ListingFilters;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export const ListingsStore = signalStore(
  { providedIn: 'root' },
  withState<ListingsState>({
    geoResults: [],
    searchResults: [],
    selectedListing: null,
    ownerListings: [],
    pendingListings: [],
    filters: {},
    loading: false,
    error: null,
    searchQuery: ''
  }),
  withComputed(store => ({
    filteredGeoResults: computed(() => {
      const f = store.filters();
      return store.geoResults().filter(l => {
        if (f.type && l.type !== f.type) return false;
        if (f.priceRange && l.priceRange > f.priceRange) return false;
        if (f.minRating && l.rating < f.minRating) return false;
        if (f.tags?.length && !f.tags.every(t => l.tags.includes(t))) return false;
        return true;
      });
    }),
    hasResults: computed(() => store.geoResults().length > 0 || store.searchResults().length > 0)
  })),
  withMethods((store,
    listingsService = inject(ListingsService),
    geoService = inject(GeoQueryService),
    algoliaService = inject(AlgoliaService),
    authStore = inject(AuthStore)
  ) => ({
    async loadGeoResults(params: GeoSearchParams): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const results = await firstValueFrom(geoService.queryByRadius(params));
        patchState(store, { geoResults: results, loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async loadById(id: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const listing = await listingsService.getById(id);
        patchState(store, { selectedListing: listing, loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async loadOwnerListings(): Promise<void> {
      const uid = authStore.uid();
      if (!uid) return;
      patchState(store, { loading: true });
      try {
        const listings = await listingsService.getByOwner(uid);
        patchState(store, { ownerListings: listings, loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async loadPendingListings(): Promise<void> {
      patchState(store, { loading: true });
      try {
        const listings = await listingsService.getPendingListings();
        patchState(store, { pendingListings: listings, loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async searchAlgolia(queryText: string, filters: AlgoliaFilters = {}): Promise<void> {
      patchState(store, { loading: true, searchQuery: queryText });
      try {
        const results = await firstValueFrom(algoliaService.searchListings(queryText, filters));
        patchState(store, { searchResults: results, loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async createListing(data: ListingFormData, photos: File[]): Promise<string> {
      const uid = authStore.uid();
      if (!uid) throw new Error('Not authenticated');
      patchState(store, { loading: true });
      try {
        const id = await listingsService.createListing(data, uid);
        if (photos.length > 0) {
          const photoUrls = await listingsService.uploadPhotos(id, photos);
          await listingsService.updateListing(id, { photos: photoUrls });
        }
        if (uid) {
          const listings = await listingsService.getByOwner(uid);
          patchState(store, { ownerListings: listings });
        }
        patchState(store, { loading: false });
        return id;
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
        throw err;
      }
    },

    async updateListing(id: string, data: Partial<ListingFormData>): Promise<void> {
      patchState(store, { loading: true });
      try {
        await listingsService.updateListing(id, data);
        const uid = authStore.uid();
        if (uid) {
          const listings = await listingsService.getByOwner(uid);
          patchState(store, { ownerListings: listings });
        }
        patchState(store, { loading: false });
      } catch (err) {
        patchState(store, { loading: false, error: parseHttpError(err) });
      }
    },

    async deleteListing(id: string): Promise<void> {
      await listingsService.deleteListing(id);
      patchState(store, {
        ownerListings: store.ownerListings().filter(l => l.id !== id)
      });
    },

    async approveListing(id: string): Promise<void> {
      await listingsService.approveListing(id);
      patchState(store, {
        pendingListings: store.pendingListings().filter(l => l.id !== id)
      });
    },

    async rejectListing(id: string, reason: string): Promise<void> {
      await listingsService.rejectListing(id, reason);
      patchState(store, {
        pendingListings: store.pendingListings().filter(l => l.id !== id)
      });
    },

    setFilters(filters: ListingFilters): void {
      patchState(store, { filters });
    },

    clearFilters(): void {
      patchState(store, { filters: {} });
    },

    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
