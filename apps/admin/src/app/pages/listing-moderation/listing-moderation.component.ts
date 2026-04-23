import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { SpinnerComponent } from '@nerastay/ui';
import { ListingsService } from '@nerastay/listings';
import { Listing } from '@nerastay/shared';
import { DatePipe } from '@angular/common';

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

@Component({
  selector: 'ns-listing-moderation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, DatePipe],
  template: `
    <div class="moderation">
      <div class="moderation__header">
        <h1 class="moderation__title">Listing Moderation</h1>
        <div class="filter-tabs" role="group" aria-label="Filter by status">
          @for (f of FILTERS; track f.value) {
            <button class="filter-tab" [class.filter-tab--active]="activeFilter() === f.value"
                    (click)="setFilter(f.value)">{{ f.label }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <ns-spinner label="Loading listings…" />
      } @else if (filtered().length === 0) {
        <p class="empty">No listings matching this filter.</p>
      } @else {
        <div class="listing-table">
          <div class="table-head">
            <span>Listing</span>
            <span>Type</span>
            <span>Host</span>
            <span>Created</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          @for (listing of filtered(); track listing.id) {
            <div class="table-row">
              <div class="listing-cell">
                @if (listing.photos[0]) {
                  <img [src]="listing.photos[0]" [alt]="listing.name" class="listing-thumb" />
                }
                <div>
                  <p class="listing-name">{{ listing.name }}</p>
                  <p class="listing-location">{{ listing.city }}, {{ listing.country }}</p>
                </div>
              </div>
              <span class="cell">{{ listing.type }}</span>
              <span class="cell">{{ listing.hostId.slice(0, 8) }}…</span>
              <span class="cell">{{ listing.createdAt | date:'mediumDate' }}</span>
              <span class="cell">
                <span class="badge badge--{{ listing.status }}">{{ listing.status }}</span>
              </span>
              <div class="cell cell--actions">
                @if (listing.status !== 'approved') {
                  <button class="action-btn action-btn--approve"
                          [disabled]="processingId() === listing.id"
                          (click)="approve(listing.id)">Approve</button>
                }
                @if (listing.status !== 'rejected') {
                  <button class="action-btn action-btn--reject"
                          [disabled]="processingId() === listing.id"
                          (click)="reject(listing.id)">Reject</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .moderation { padding: 32px; }
    .moderation__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .moderation__title { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .filter-tabs { display: flex; gap: 4px; }
    .filter-tab { padding: 6px 16px; border: 1.5px solid #e2e8f0; border-radius: 20px; background: transparent; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: #64748b; &--active { background: #3b82f6; border-color: #3b82f6; color: #fff; } &:focus-visible { outline: 2px solid #3b82f6; } }
    .listing-table { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
    .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; padding: 12px 20px; background: #f8fafc; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; }
    .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr; padding: 14px 20px; border-top: 1px solid #e2e8f0; align-items: center; gap: 8px; &:hover { background: #f8fafc; } }
    .listing-cell { display: flex; align-items: center; gap: 10px; }
    .listing-thumb { width: 44px; height: 34px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
    .listing-name { font-weight: 600; font-size: 0.88rem; margin: 0; }
    .listing-location { font-size: 0.78rem; color: #64748b; margin: 0; }
    .cell { font-size: 0.85rem; color: #334155; &--actions { display: flex; gap: 6px; } }
    .badge { padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
    .badge--pending { background: #fffbeb; color: #92400e; }
    .badge--approved { background: #f0fdf4; color: #15803d; }
    .badge--rejected { background: #fef2f2; color: #b91c1c; }
    .action-btn { padding: 4px 12px; border-radius: 6px; border: 1.5px solid; font-size: 0.78rem; font-weight: 600; cursor: pointer; &--approve { border-color: #16a34a; color: #16a34a; background: transparent; &:hover { background: #f0fdf4; } } &--reject { border-color: #dc2626; color: #dc2626; background: transparent; &:hover { background: #fef2f2; } } &:disabled { opacity: 0.4; cursor: not-allowed; } &:focus-visible { outline: 2px solid #3b82f6; } }
    .empty { color: #64748b; padding: 40px; text-align: center; }
  `]
})
export class ListingModerationComponent implements OnInit {
  readonly FILTERS: Array<{ label: string; value: FilterStatus }> = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'All', value: 'all' }
  ];

  private listingsService = inject(ListingsService);
  readonly loading = signal(true);
  readonly listings = signal<Listing[]>([]);
  readonly activeFilter = signal<FilterStatus>('pending');
  readonly processingId = signal<string | null>(null);

  readonly filtered = () => {
    const f = this.activeFilter();
    const all = this.listings();
    return f === 'all' ? all : all.filter(l => l.status === f);
  };

  async ngOnInit(): Promise<void> {
    try {
      const all = await this.listingsService.getPendingListings();
      this.listings.set(all);
    } finally {
      this.loading.set(false);
    }
  }

  async approve(id: string): Promise<void> {
    this.processingId.set(id);
    await this.listingsService.approveListing(id);
    this.listings.update(ls => ls.map(l => l.id === id ? { ...l, status: 'approved' as const } : l));
    this.processingId.set(null);
  }

  async reject(id: string): Promise<void> {
    this.processingId.set(id);
    await this.listingsService.rejectListing(id);
    this.listings.update(ls => ls.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l));
    this.processingId.set(null);
  }

  setFilter(f: FilterStatus): void { this.activeFilter.set(f); }
}
