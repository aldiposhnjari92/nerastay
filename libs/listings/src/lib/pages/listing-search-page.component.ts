import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ListingsStore } from '../store/listings.store';
import { MapStore, MapViewComponent } from '@nerastay/map';
import { ListingCardComponent } from '../components/listing-card/listing-card.component';
import { SpinnerComponent } from '@nerastay/ui';
import { GeolocationService, GeoPoint } from '@nerastay/shared';
import { ListingType } from '@nerastay/shared';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const TYPE_FILTERS: Array<{ id: ListingType | null; label: string }> = [
  { id: null, label: 'All' },
  { id: 'hotel', label: '🏨 Hotels' },
  { id: 'restaurant', label: '🍽️ Restaurants' },
  { id: 'villa', label: '🏡 Villas' }
];

@Component({
  selector: 'ns-listing-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MapViewComponent, ListingCardComponent, SpinnerComponent],
  template: `
    <div class="search-page">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar__search">
          <input type="search" class="input input--search" [formControl]="searchCtrl"
                 placeholder="Search listings by name, city…" aria-label="Search listings" />
        </div>

        <div class="toolbar__filters" role="group" aria-label="Filter by type">
          @for (f of typeFilters; track f.id) {
            <button
              class="filter-chip"
              [class.filter-chip--active]="activeType() === f.id"
              (click)="setType(f.id)"
              [attr.aria-pressed]="activeType() === f.id">
              {{ f.label }}
            </button>
          }
        </div>

        <div class="toolbar__view" role="group" aria-label="Toggle view">
          <button class="view-btn" [class.view-btn--active]="mapStore.viewMode() === 'list'"
                  (click)="mapStore.setViewMode('list')" aria-label="List view">☰</button>
          <button class="view-btn" [class.view-btn--active]="mapStore.viewMode() === 'split'"
                  (click)="mapStore.setViewMode('split')" aria-label="Split view">⊟</button>
          <button class="view-btn" [class.view-btn--active]="mapStore.viewMode() === 'map'"
                  (click)="mapStore.setViewMode('map')" aria-label="Map view">🗺️</button>
        </div>
      </div>

      <div class="search-layout" [class]="'search-layout--' + mapStore.viewMode()">
        <!-- Map -->
        @if (mapStore.viewMode() !== 'list') {
          <div class="map-panel">
            <ns-map-view
              [listings]="listingsStore.filteredGeoResults()"
              (boundsChanged)="onBoundsChanged($event)" />
          </div>
        }

        <!-- List -->
        @if (mapStore.viewMode() !== 'map') {
          <div class="list-panel">
            <p class="result-count" aria-live="polite" aria-atomic="true">
              @if (listingsStore.loading()) {
                Searching…
              } @else {
                {{ listingsStore.filteredGeoResults().length }} places found
              }
            </p>

            @if (listingsStore.loading()) {
              <ns-spinner label="Finding places near you…" />
            } @else if (listingsStore.filteredGeoResults().length === 0) {
              <div class="empty-state" role="status">
                <span aria-hidden="true">🔍</span>
                <p>No listings found in this area. Try expanding the search radius or moving the map.</p>
              </div>
            } @else {
              <div class="listing-grid">
                @for (listing of listingsStore.filteredGeoResults(); track listing.id) {
                  <ns-listing-card
                    [listing]="listing"
                    (hovered)="mapStore.hoverListing($event)" />
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: 'listing-search-page.component.scss'
})
export class ListingSearchPageComponent implements OnInit {
  readonly listingsStore = inject(ListingsStore);
  readonly mapStore = inject(MapStore);
  private geoService = inject(GeolocationService);

  readonly typeFilters = TYPE_FILTERS;
  readonly activeType = signal<ListingType | null>(null);
  readonly searchCtrl = new FormControl('');

  ngOnInit(): void {
    this.geoService.getCurrentPosition().subscribe({
      next: center => {
        this.mapStore.setCenter(center);
        this.triggerGeoSearch(center);
      },
      error: () => this.triggerGeoSearch(this.mapStore.center())
    });

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q && q.trim()) {
        this.listingsStore.searchAlgolia(q.trim(), {
          type: this.activeType() ?? undefined
        });
      }
    });
  }

  onBoundsChanged(params: { center: GeoPoint; radiusKm: number }): void {
    this.triggerGeoSearch(params.center, params.radiusKm);
  }

  private triggerGeoSearch(center: GeoPoint, radiusKm?: number): void {
    this.listingsStore.loadGeoResults({
      center,
      radiusKm: radiusKm ?? this.mapStore.radiusKm()
    });
  }

  setType(type: ListingType | null): void {
    this.activeType.set(type);
    this.listingsStore.setFilters(type ? { type } : {});
  }
}
