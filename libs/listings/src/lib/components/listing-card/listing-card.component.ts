import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListingWithDistance } from '@nerastay/shared';
import { StarRatingComponent, DistancePipe } from '@nerastay/ui';
import { TitleCasePipe } from '@angular/common';

const PRICE_LABELS: Record<number, string> = { 1: '€', 2: '€€', 3: '€€€', 4: '€€€€' };
const TYPE_ICONS: Record<string, string> = { hotel: '🏨', restaurant: '🍽️', villa: '🏡' };

@Component({
  selector: 'ns-listing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarRatingComponent, DistancePipe, TitleCasePipe],
  template: `
    <a
      [routerLink]="['/listings', listing().id]"
      class="card"
      (mouseenter)="hovered.emit(listing().id)"
      (mouseleave)="hovered.emit(null)"
      [attr.aria-label]="listing().name + ', ' + listing().type + ', ' + listing().city">

      <div class="card__img-wrap">
        <img
          [src]="listing().photos[0] || '/assets/placeholder.jpg'"
          [alt]="listing().name"
          class="card__img"
          loading="lazy" />

        <span class="card__type-badge" [attr.aria-label]="listing().type">
          <span aria-hidden="true">{{ typeIcon() }}</span>
          {{ listing().type | titlecase }}
        </span>

        @if (listing().featured) {
          <span class="card__featured" aria-label="Featured listing">⭐ Featured</span>
        }

        @if (listing().distanceKm !== undefined) {
          <span class="card__distance" aria-label="{{ listing().distanceKm | distance }} away">
            {{ listing().distanceKm | distance }}
          </span>
        }
      </div>

      <div class="card__body">
        <h3 class="card__name">{{ listing().name }}</h3>
        <p class="card__city">{{ listing().city }}</p>

        <div class="card__footer">
          <ns-star-rating [value]="listing().rating" [count]="listing().reviewCount" />
          <span class="card__price" [attr.aria-label]="'Price range: ' + priceLabel()">
            {{ priceLabel() }}
          </span>
        </div>
      </div>
    </a>
  `,
  styleUrl: 'listing-card.component.scss'
})
export class ListingCardComponent {
  listing = input.required<ListingWithDistance>();
  hovered = output<string | null>();

  readonly typeIcon = computed(() => TYPE_ICONS[this.listing().type] ?? '📍');
  readonly priceLabel = computed(() => PRICE_LABELS[this.listing().priceRange] ?? '');
}
