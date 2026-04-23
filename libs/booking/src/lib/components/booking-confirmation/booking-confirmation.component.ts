import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { SpinnerComponent } from '@nerastay/ui';
import { BookingStore } from '../../store/booking.store';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'ns-booking-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SpinnerComponent, DecimalPipe, DatePipe],
  template: `
    <div class="confirmation-page">
      @if (bookingStore.loading()) {
        <ns-spinner label="Loading your booking…" />
      } @else if (bookingStore.currentBooking(); as booking) {
        <div class="confirmation-card">
          <div class="confirmation-icon" aria-hidden="true">
            @if (booking.paymentStatus === 'paid') { ✅ } @else { 🕐 }
          </div>
          <h1 class="confirmation-title">
            {{ booking.paymentStatus === 'paid' ? 'Booking Confirmed!' : 'Booking Pending' }}
          </h1>
          <p class="confirmation-subtitle">
            {{ booking.paymentStatus === 'paid'
              ? 'Your reservation has been confirmed. Check your email for details.'
              : 'Your booking is pending payment confirmation.' }}
          </p>

          <div class="booking-summary">
            <h2 class="summary-title">{{ booking.listingName }}</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Check-in</span>
                <span class="summary-value">{{ booking.checkIn | date:'fullDate' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Check-out</span>
                <span class="summary-value">{{ booking.checkOut | date:'fullDate' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Guests</span>
                <span class="summary-value">{{ booking.guests }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Nights</span>
                <span class="summary-value">{{ booking.nights }}</span>
              </div>
            </div>

            <div class="price-breakdown">
              <div class="price-row">
                <span>{{ booking.currency }} {{ booking.pricePerNight }} × {{ booking.nights }} nights</span>
                <span>{{ booking.currency }} {{ booking.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="price-row">
                <span>Service fee</span>
                <span>{{ booking.currency }} {{ booking.serviceFee | number:'1.2-2' }}</span>
              </div>
              <div class="price-row price-row--total">
                <span>Total paid</span>
                <span>{{ booking.currency }} {{ booking.total | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div class="confirmation-actions">
            <a routerLink="/bookings" class="btn btn--outline">View All Bookings</a>
            <a [routerLink]="['/listings', booking.listingId]" class="btn btn--primary">View Listing</a>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <p>Booking not found.</p>
          <a routerLink="/bookings" class="btn btn--primary">My Bookings</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation-page { max-width: 580px; margin: 60px auto; padding: 0 24px; }
    .confirmation-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px 32px; text-align: center; }
    .confirmation-icon { font-size: 3rem; margin-bottom: 16px; }
    .confirmation-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 8px; }
    .confirmation-subtitle { color: var(--text-muted); margin: 0 0 32px; }
    .booking-summary { text-align: left; border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .summary-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .summary-value { font-size: 0.95rem; font-weight: 600; }
    .price-breakdown { border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .price-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
    .price-row--total { font-weight: 700; font-size: 1rem; color: var(--text); border-top: 1px solid var(--border); padding-top: 10px; }
    .confirmation-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .not-found { text-align: center; padding: 60px 0; color: var(--text-muted); a { margin-top: 16px; display: inline-block; } }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  readonly bookingStore = inject(BookingStore);
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookingStore.loadBooking(id);
      const sessionId = this.route.snapshot.queryParamMap.get('session_id');
      if (sessionId) this.bookingService.markPaid(id, sessionId).catch(() => {});
    }
  }
}
