import {
  Component, inject, ChangeDetectionStrategy, ElementRef, ViewChild,
  signal, computed, effect, OnInit, OnDestroy, input, output
} from '@angular/core';
import { MapLoaderService } from '../../map-loader.service';
import { MapStore } from '../../store/map.store';
import { ListingWithDistance, GeoPoint } from '@nerastay/shared';

@Component({
  selector: 'ns-map-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-wrapper">
      <div #mapEl class="map-el" role="application" aria-label="Interactive map of listings"></div>

      <div class="map-controls">
        <button class="map-btn" (click)="locateUser()" [disabled]="mapStore.isLocating()"
                aria-label="Center map on my location">
          {{ mapStore.isLocating() ? '…' : '📍' }}
        </button>
        <div class="map-radius">
          <label for="radius-slider" class="sr-only">Search radius</label>
          <input id="radius-slider" type="range" min="1" max="50" [value]="mapStore.radiusKm()"
                 (input)="onRadiusChange($event)" aria-label="Search radius in kilometres" />
          <span>{{ mapStore.radiusKm() }}km</span>
        </div>
      </div>

      @if (mapStore.locationError()) {
        <div class="map-error" role="alert">{{ mapStore.locationError() }}</div>
      }
    </div>
  `,
  styleUrl: 'map-view.component.scss'
})
export class MapViewComponent implements OnInit, OnDestroy {
  listings = input<ListingWithDistance[]>([]);
  boundsChanged = output<{ center: GeoPoint; radiusKm: number }>();

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private mapLoader = inject(MapLoaderService);
  readonly mapStore = inject(MapStore);

  private map: google.maps.Map | null = null;
  private markers = new Map<string, google.maps.marker.AdvancedMarkerElement>();
  private radiusCircle: google.maps.Circle | null = null;

  async ngOnInit(): Promise<void> {
    await this.mapLoader.load();
    this.initMap();

    effect(() => {
      this.syncMarkers(this.listings());
    });

    effect(() => {
      const center = this.mapStore.center();
      if (this.map) this.map.panTo(center);
      this.updateRadiusCircle();
    });
  }

  private initMap(): void {
    const center = this.mapStore.center();
    this.map = new google.maps.Map(this.mapEl.nativeElement, {
      center,
      zoom: this.mapStore.zoom(),
      mapId: 'nerastay-map',
      disableDefaultUI: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    });

    this.map.addListener('idle', () => {
      const mapCenter = this.map!.getCenter();
      if (!mapCenter) return;
      const center: GeoPoint = { lat: mapCenter.lat(), lng: mapCenter.lng() };
      this.mapStore.setCenter(center);
      this.boundsChanged.emit({ center, radiusKm: this.mapStore.radiusKm() });
    });

    this.updateRadiusCircle();
  }

  private syncMarkers(listings: ListingWithDistance[]): void {
    if (!this.map) return;

    const newIds = new Set(listings.map(l => l.id));
    for (const [id, marker] of this.markers) {
      if (!newIds.has(id)) {
        marker.map = null;
        this.markers.delete(id);
      }
    }

    for (const listing of listings) {
      if (this.markers.has(listing.id)) continue;
      const el = document.createElement('div');
      el.className = 'price-marker';
      el.innerHTML = `<span>€${'€'.repeat(listing.priceRange - 1)}</span>`;
      el.setAttribute('aria-label', `${listing.name}, price range ${listing.priceRange}`);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: listing.coordinates,
        content: el,
        title: listing.name
      });

      marker.addListener('click', () => {
        this.mapStore.selectListing(listing.id);
      });

      this.markers.set(listing.id, marker);
    }

    const hovered = this.mapStore.hoveredListingId();
    for (const [id, marker] of this.markers) {
      const el = marker.content as HTMLElement;
      el.classList.toggle('price-marker--hovered', id === hovered);
    }
  }

  private updateRadiusCircle(): void {
    if (!this.map) return;
    this.radiusCircle?.setMap(null);
    this.radiusCircle = new google.maps.Circle({
      map: this.map,
      center: this.mapStore.center(),
      radius: this.mapStore.radiusKm() * 1000,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.5,
      strokeWeight: 1.5,
      fillColor: '#3b82f6',
      fillOpacity: 0.05
    });
  }

  locateUser(): void {
    this.mapStore.setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const center: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.mapStore.setCenter(center);
        this.mapStore.setLocating(false);
        this.map?.panTo(center);
        this.boundsChanged.emit({ center, radiusKm: this.mapStore.radiusKm() });
      },
      () => {
        this.mapStore.setLocating(false);
        this.mapStore.setLocationError('Could not access your location.');
      }
    );
  }

  onRadiusChange(e: Event): void {
    const radius = Number((e.target as HTMLInputElement).value);
    this.mapStore.setRadius(radius);
    this.updateRadiusCircle();
    this.boundsChanged.emit({ center: this.mapStore.center(), radiusKm: radius });
  }

  ngOnDestroy(): void {
    this.markers.forEach(m => { m.map = null; });
    this.radiusCircle?.setMap(null);
  }
}
