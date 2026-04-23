import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListingsStore } from '../../store/listings.store';
import { SpinnerComponent } from '@nerastay/ui';

const STATUS_STYLES: Record<string, string> = {
  approved: 'badge--green',
  pending: 'badge--yellow',
  rejected: 'badge--red'
};

@Component({
  selector: 'ns-host-listings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SpinnerComponent],
  template: `
    <div class="host-listings">
      <div class="host-listings__header">
        <h1 class="host-listings__title">My Listings</h1>
        <a routerLink="/listings/new" class="btn btn--primary">+ New Listing</a>
      </div>

      @if (store.loading()) {
        <ns-spinner label="Loading your listings…" />
      } @else if (store.ownerListings().length === 0) {
        <div class="empty" role="status">
          <span aria-hidden="true">🏨</span>
          <p>You haven't published any listings yet.</p>
          <a routerLink="/listings/new" class="btn btn--primary">Publish your first listing</a>
        </div>
      } @else {
        <div class="listings-table" role="table" aria-label="Your listings">
          <div class="listings-table__head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Rating</span>
            <span role="columnheader">Actions</span>
          </div>

          @for (listing of store.ownerListings(); track listing.id) {
            <div class="listings-table__row" role="row">
              <div class="listings-table__cell" role="cell">
                <img [src]="listing.photos[0] || '/assets/placeholder.jpg'"
                     [alt]="listing.name" class="listing-thumb" />
                <span class="listing-name">{{ listing.name }}</span>
              </div>
              <span class="listings-table__cell" role="cell">{{ listing.type | titlecase }}</span>
              <span class="listings-table__cell" role="cell">
                <span class="badge" [class]="statusStyle(listing.status)">{{ listing.status }}</span>
              </span>
              <span class="listings-table__cell" role="cell">
                {{ listing.rating > 0 ? (listing.rating | number:'1.1-1') + ' ★' : '—' }}
                @if (listing.reviewCount > 0) { <span class="text-muted">({{ listing.reviewCount }})</span> }
              </span>
              <div class="listings-table__cell" role="cell">
                <a [routerLink]="['/listings', listing.id, 'edit']" class="btn btn--ghost btn--sm">Edit</a>
                <a [routerLink]="['/listings', listing.id]" class="btn btn--outline btn--sm">View</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .host-listings { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .host-listings__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .host-listings__title { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; text-align: center; font-size: 3rem; p { font-size: 1rem; color: var(--text-muted); margin: 0; } }
    .listings-table { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
    .listings-table__head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 20px; background: var(--bg); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .listings-table__row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 16px 20px; border-top: 1px solid var(--border); align-items: center; gap: 12px; &:hover { background: var(--bg); } }
    .listings-table__cell { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
    .listing-thumb { width: 48px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
    .listing-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
    .badge--green { background: #f0fdf4; color: #15803d; }
    .badge--yellow { background: #fffbeb; color: #92400e; }
    .badge--red { background: #fef2f2; color: #b91c1c; }
    .text-muted { color: var(--text-muted); font-size: 0.8rem; }
  `]
})
export class HostListingsComponent implements OnInit {
  readonly store = inject(ListingsStore);

  ngOnInit(): void { this.store.loadOwnerListings(); }

  statusStyle(status: string): string { return STATUS_STYLES[status] ?? ''; }
}
