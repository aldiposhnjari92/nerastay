import { Component, inject, input, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DateRangePickerComponent, SpinnerComponent } from '@nerastay/ui';
import { AuthStore } from '@nerastay/auth';
import { BookingStore } from '../../store/booking.store';
import { Listing, nightsBetween, futureDateValidator, dateRangeValidator } from '@nerastay/shared';

@Component({
  selector: 'ns-booking-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DateRangePickerComponent, SpinnerComponent, DecimalPipe],
  template: `
    <div class="booking-panel">
      <div class="booking-panel__price">
        <span class="price-amount">{{ listing().currency }} {{ listing().pricePerNight | number }}</span>
        <span class="price-unit"> / night</span>
      </div>

      @if (authStore.isLoggedIn()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="booking-form" novalidate>
          <ns-date-range-picker
            [blockedDates]="bookingStore.blockedDates()"
            (rangeSelected)="onRangeSelected($event)" />

          @if (form.errors?.['invalidRange'] && form.touched) {
            <p class="field-error" role="alert">Check-out must be after check-in.</p>
          }

          <div class="form-field">
            <label for="guests" class="form-label">Guests</label>
            <input id="guests" type="number" class="input" formControlName="guests"
                   [attr.min]="1" [attr.max]="listing().maxGuests ?? 20" />
            @if (form.get('guests')?.invalid && form.get('guests')?.touched) {
              <p class="field-error" role="alert">Please enter a valid guest count.</p>
            }
          </div>

          <div class="form-field">
            <label for="requests" class="form-label">Special requests <span class="optional">(optional)</span></label>
            <textarea id="requests" class="input input--textarea" formControlName="specialRequests"
                      rows="3" placeholder="Dietary requirements, accessibility needs…"></textarea>
          </div>

          @if (nights() > 0) {
            <div class="price-breakdown">
              <div class="price-row">
                <span>{{ listing().currency }} {{ listing().pricePerNight }} × {{ nights() }} nights</span>
                <span>{{ listing().currency }} {{ subtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="price-row">
                <span>Service fee</span>
                <span>{{ listing().currency }} {{ serviceFee() | number:'1.2-2' }}</span>
              </div>
              <div class="price-row price-row--total">
                <span>Total</span>
                <span>{{ listing().currency }} {{ total() | number:'1.2-2' }}</span>
              </div>
            </div>
          }

          @if (bookingStore.error()) {
            <p class="form-error" role="alert">{{ bookingStore.error() }}</p>
          }

          <button type="submit" class="btn btn--primary btn--full"
                  [disabled]="form.invalid || bookingStore.checkoutLoading()">
            @if (bookingStore.checkoutLoading()) {
              <ns-spinner />
            } @else {
              Book Now
            }
          </button>
        </form>
      } @else {
        <div class="login-prompt">
          <p>Sign in to book this listing</p>
          <a routerLink="/auth/login" class="btn btn--primary btn--full">Sign In</a>
          <a routerLink="/auth/register" class="btn btn--outline btn--full">Create Account</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .booking-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
    .booking-panel__price { margin-bottom: 20px; }
    .price-amount { font-size: 1.5rem; font-weight: 800; }
    .price-unit { color: var(--text-muted); font-size: 0.9rem; }
    .booking-form { display: flex; flex-direction: column; gap: 16px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .optional { font-weight: 400; color: var(--text-muted); }
    .input--textarea { resize: vertical; min-height: 80px; }
    .field-error, .form-error { font-size: 0.8rem; color: var(--error, #dc2626); margin: 0; }
    .price-breakdown { border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }
    .price-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
    .price-row--total { font-weight: 700; font-size: 1rem; color: var(--text); border-top: 1px solid var(--border); padding-top: 10px; }
    .btn--full { width: 100%; justify-content: center; }
    .login-prompt { display: flex; flex-direction: column; gap: 12px; text-align: center; p { color: var(--text-muted); margin: 0 0 4px; } }
  `]
})
export class BookingPanelComponent implements OnInit {
  readonly listing = input.required<Listing>();

  readonly authStore = inject(AuthStore);
  readonly bookingStore = inject(BookingStore);
  private fb = inject(FormBuilder);

  readonly checkIn = signal<Date | null>(null);
  readonly checkOut = signal<Date | null>(null);

  readonly nights = computed(() => {
    const ci = this.checkIn(), co = this.checkOut();
    return ci && co ? nightsBetween(ci, co) : 0;
  });
  readonly subtotal = computed(() => this.nights() * this.listing().pricePerNight);
  readonly serviceFee = computed(() => Math.round(this.subtotal() * 0.1 * 100) / 100);
  readonly total = computed(() => this.subtotal() + this.serviceFee());

  readonly form = this.fb.group({
    checkIn: [null as Date | null, [Validators.required, futureDateValidator()]],
    checkOut: [null as Date | null, [Validators.required, futureDateValidator()]],
    guests: [1, [Validators.required, Validators.min(1)]],
    specialRequests: ['']
  }, { validators: dateRangeValidator('checkIn', 'checkOut') });

  ngOnInit(): void {
    this.bookingStore.loadBlockedDates(this.listing().id);
  }

  onRangeSelected(range: { start: Date; end: Date }): void {
    this.checkIn.set(range.start);
    this.checkOut.set(range.end);
    this.form.patchValue({ checkIn: range.start, checkOut: range.end });
    this.form.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { checkIn, checkOut, guests, specialRequests } = this.form.value;
    const l = this.listing();
    await this.bookingStore.initiateBooking(
      { listingId: l.id, checkIn: checkIn!, checkOut: checkOut!, guests: guests!, specialRequests: specialRequests ?? null },
      { id: l.id, name: l.name, photos: l.photos, pricePerNight: l.pricePerNight, currency: l.currency, hostId: l.hostId }
    );
  }
}
