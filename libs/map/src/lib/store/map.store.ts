import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { GeoPoint } from '@nerastay/shared';

export type MapViewMode = 'map' | 'list' | 'split';

interface MapState {
  center: GeoPoint;
  zoom: number;
  radiusKm: number;
  viewMode: MapViewMode;
  hoveredListingId: string | null;
  selectedListingId: string | null;
  isLocating: boolean;
  locationError: string | null;
}

const DEFAULT_CENTER: GeoPoint = { lat: 41.9028, lng: 12.4964 }; // Rome

export const MapStore = signalStore(
  { providedIn: 'root' },
  withState<MapState>({
    center: DEFAULT_CENTER,
    zoom: 12,
    radiusKm: 5,
    viewMode: 'split',
    hoveredListingId: null,
    selectedListingId: null,
    isLocating: false,
    locationError: null
  }),
  withComputed(store => ({
    mapBounds: computed(() => {
      const { lat, lng } = store.center();
      const delta = store.radiusKm() / 111;
      return {
        north: lat + delta,
        south: lat - delta,
        east: lng + delta / Math.cos((lat * Math.PI) / 180),
        west: lng - delta / Math.cos((lat * Math.PI) / 180)
      };
    })
  })),
  withMethods(store => ({
    setCenter(center: GeoPoint): void {
      patchState(store, { center });
    },
    setZoom(zoom: number): void {
      patchState(store, { zoom });
    },
    setRadius(radiusKm: number): void {
      patchState(store, { radiusKm });
    },
    setViewMode(viewMode: MapViewMode): void {
      patchState(store, { viewMode });
    },
    hoverListing(id: string | null): void {
      patchState(store, { hoveredListingId: id });
    },
    selectListing(id: string | null): void {
      patchState(store, { selectedListingId: id });
    },
    setLocating(isLocating: boolean): void {
      patchState(store, { isLocating });
    },
    setLocationError(error: string | null): void {
      patchState(store, { locationError: error });
    }
  }))
);
