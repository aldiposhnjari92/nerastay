import { Component, inject, OnInit, signal, ChangeDetectionStrategy, output, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { SpinnerComponent } from '@nerastay/ui';
import { BookingStore } from '../../store/booking.store';
import { AuthStore } from '@nerastay/auth';
import { Booking } from '@nerastay/shared';

type Tab = 'trips' | 'reservations';

@Component({
  selector: 'ns-booking-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="booking-card" [class.booking-card--cancelled]="booking().status === 'cancelled'">
      @if (booking().listingPhoto) {
        <img class="booking-card__img" [src]="booking().listingPhoto!" [alt]="booking().listingName" />
      }
      <div class="booking-card__body">
        <div class="booking-card__top">
          <div>
            <p class="booking-card__name">{{ booking().listingName }}</p>
            <p class="booking-card__dates">
              {{ booking().checkIn | date:'mediumDate' }} – {{ booking().checkOut | date:'mediumDate' }}
              · {{ booking().nights }} night{{ booking().nights !== 1 ? 's' : '' }}
              · {{ booking().guests }} guest{{ booking().guests !== 1 ? 's' : '' }}
            </p>
          </div>
          <span class="status-badge" [class]="'status-badge--' + booking().status">{{ booking().status }}</span>
        </div>
        <p class="booking-card__total">Total: {{ booking().currency }} {{ booking().total | number:'1.2-2' }}</p>
        <div class="booking-card__actions">
          <a [routerLink]="['/listings', booking().listingId]" class="btn btn--outline btn--sm">View Listing</a>
          @if (isHost()) {
            <a [routerLink]="['/bookings', booking().id]" class="btn btn--ghost btn--sm">Details</a>
          }
          @if (!isHost() && booking().status === 'confirmed' && booking().checkIn > today) {
            <button class="btn btn--ghost btn--sm btn--danger" (click)="cancelled.emit(booking().id)">Cancel</button>
          }
          @if (showReview() && booking().status === 'confirmed' && booking().checkOut <= today) {
            <a [routerLink]="['/listings', booking().listingId]" fragment="reviews" class="btn btn--ghost btn--sm">Write Review</a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-card { display: flex; gap: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; &--cancelled { opacity: 0.6; } }
    .booking-card__img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .booking-card__body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .booking-card__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .booking-card__name { font-weight: 700; margin: 0 0 4px; }
    .booking-card__dates { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
    .booking-card__total { font-size: 0.9rem; font-weight: 600; margin: 0; }
    .booking-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn--danger { color: var(--error, #dc2626); }
    .status-badge { padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; white-space: nowrap; }
    .status-badge--pending { background: #fffbeb; color: #92400e; }
    .status-badge--confirmed { background: #f0fdf4; color: #15803d; }
    .status-badge--cancelled { background: #fef2f2; color: #b91c1c; }
    .status-badge--completed { background: #f0f9ff; color: #0369a1; }
  `]
})
export class BookingCardComponent {
  readonly booking = input.required<Booking>();
  readonly isHost = input(false);
  readonly showReview = input(false);
  readonly cancelled = output<string>();
  readonly today = new Date();
}

@Component({
  selector: 'ns-booking-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BookingCardComponent, SpinnerComponent, RouterLink],
  template: `
    <div class="booking-list">
      <div class="booking-list__header">
        <h1 class="booking-list__title">
          {{ authStore.isOwner() ? 'Bookings' : 'My Trips' }}
        </h1>
      </div>

      @if (authStore.isOwner()) {
        <div class="tabs" role="tablist">
          <button role="tab" class="tab" [class.tab--active]="activeTab() === 'trips'"
                  [attr.aria-selected]="activeTab() === 'trips'"
                  (click)="setTab('trips')">My Trips</button>
          <button role="tab" class="tab" [class.tab--active]="activeTab() === 'reservations'"
                  [attr.aria-selected]="activeTab() === 'reservations'"
                  (click)="setTab('reservations')">Reservations</button>
        </div>
      }

      @if (bookingStore.loading()) {
        <ns-spinner label="Loading bookings…" />
      } @else {
        @if (activeTab() === 'trips') {
          <div class="booking-section">
            <h2 class="section-title">Upcoming</h2>
            @if (bookingStore.upcomingTrips().length === 0) {
              <p class="empty-msg">No upcoming trips. <a routerLink="/listings">Find a place to stay</a>.</p>
            } @else {
              @for (b of bookingStore.upcomingTrips(); track b.id) {
                <ns-booking-card [booking]="b" (cancelled)="onCancel($event)" />
              }
            }
            <h2 class="section-title">Past</h2>
            @if (bookingStore.pastTrips().length === 0) {
              <p class="empty-msg">No past trips yet.</p>
            } @else {
              @for (b of bookingStore.pastTrips(); track b.id) {
                <ns-booking-card [booking]="b" [showReview]="true" />
              }
            }
          </div>
        } @else {
          <div class="booking-section">
            <h2 class="section-title">Pending ({{ bookingStore.pendingReservations().length }})</h2>
            @if (bookingStore.pendingReservations().length === 0) {
              <p class="empty-msg">No pending reservations.</p>
            } @else {
              @for (b of bookingStore.pendingReservations(); track b.id) {
                <ns-booking-card [booking]="b" [isHost]="true" />
              }
            }
            <h2 class="section-title">Confirmed</h2>
            @if (bookingStore.confirmedReservations().length === 0) {
              <p class="empty-msg">No confirmed reservations.</p>
            } @else {
              @for (b of bookingStore.confirmedReservations(); track b.id) {
                <ns-booking-card [booking]="b" [isHost]="true" />
              }
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .booking-list { max-width: 800px; margin: 40px auto; padding: 0 24px; }
    .booking-list__header { margin-bottom: 24px; }
    .booking-list__title { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 24px; }
    .tab { padding: 10px 20px; background: none; border: none; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; &--active { color: var(--primary); border-bottom-color: var(--primary); } &:focus-visible { outline: 2px solid var(--primary); } }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 12px; }
    .empty-msg { color: var(--text-muted); font-size: 0.9rem; a { color: var(--primary); } }
    .booking-section { display: flex; flex-direction: column; }
  `]
})
export class BookingListComponent implements OnInit {
  readonly bookingStore = inject(BookingStore);
  readonly authStore = inject(AuthStore);
  readonly activeTab = signal<Tab>('trips');

  ngOnInit(): void {
    this.bookingStore.loadGuestBookings();
    if (this.authStore.isOwner()) this.bookingStore.loadHostBookings();
  }

  setTab(tab: Tab): void { this.activeTab.set(tab); }

  async onCancel(bookingId: string): Promise<void> {
    await this.bookingStore.cancelBooking(bookingId);
  }
}
