import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListingsStore } from '../../store/listings.store';
import { AuthStore } from '@nerastay/auth';
import { StarRatingComponent, DistancePipe, SpinnerComponent } from '@nerastay/ui';
import { MapStore } from '@nerastay/map';

@Component({
  selector: 'ns-listing-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarRatingComponent, DistancePipe, SpinnerComponent],
  templateUrl: 'listing-detail.component.html',
  styleUrl: 'listing-detail.component.scss'
})
export class ListingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly listingsStore = inject(ListingsStore);
  readonly authStore = inject(AuthStore);
  readonly mapStore = inject(MapStore);

  readonly activePhoto = signal(0);

  readonly listing = this.listingsStore.selectedListing;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.listingsStore.loadById(id);
  }

  priceLabel(range: number): string {
    return '€'.repeat(range);
  }

  mapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}
