import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SpinnerComponent } from '@nerastay/ui';
import { BookingStore } from '../../store/booking.store';
import { AuthStore } from '@nerastay/auth';
import { Booking, toISODateString } from '@nerastay/shared';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isWithinInterval, format } from 'date-fns';

@Component({
  selector: 'ns-booking-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, DatePipe],
  template: `
    <div class="calendar-page">
      <div class="calendar-page__header">
        <h1 class="calendar-page__title">Booking Calendar</h1>
      </div>

      @if (bookingStore.loading()) {
        <ns-spinner label="Loading reservations…" />
      } @else {
        <div class="calendar-wrap">
          <div class="calendar-nav">
            <button class="nav-btn" (click)="prevMonth()" aria-label="Previous month">‹</button>
            <span class="calendar-month">{{ currentDate() | date:'MMMM yyyy' }}</span>
            <button class="nav-btn" (click)="nextMonth()" aria-label="Next month">›</button>
          </div>

          <div class="calendar-grid" role="grid" [attr.aria-label]="currentDate() | date:'MMMM yyyy'">
            @for (day of WEEKDAYS; track day) {
              <div class="calendar-day-header" role="columnheader" [attr.aria-label]="day">{{ day }}</div>
            }
            @for (cell of calendarCells(); track $index) {
              <div class="calendar-cell"
                   [class.calendar-cell--other-month]="!cell.inMonth"
                   [class.calendar-cell--booked]="cell.booking"
                   [class.calendar-cell--today]="cell.isToday"
                   role="gridcell"
                   [attr.aria-label]="cell.date | date:'fullDate'"
                   [attr.title]="cell.booking ? cell.booking.guestName + ' · ' + cell.booking.guests + ' guests' : null">
                <span class="calendar-cell__num">{{ cell.date | date:'d' }}</span>
                @if (cell.booking && cell.isCheckIn) {
                  <span class="booking-dot booking-dot--in" aria-hidden="true">IN</span>
                } @else if (cell.booking && cell.isCheckOut) {
                  <span class="booking-dot booking-dot--out" aria-hidden="true">OUT</span>
                } @else if (cell.booking) {
                  <span class="booking-dot" aria-hidden="true"></span>
                }
              </div>
            }
          </div>

          <div class="legend" aria-label="Legend">
            <span class="legend-item"><span class="legend-dot booking-dot--in"></span> Check-in</span>
            <span class="legend-item"><span class="legend-dot booking-dot--out"></span> Check-out</span>
            <span class="legend-item"><span class="legend-dot legend-dot--stay"></span> Staying</span>
          </div>
        </div>

        <div class="reservations-list">
          <h2 class="reservations-title">This Month's Reservations</h2>
          @if (thisMonthReservations().length === 0) {
            <p class="empty-msg">No reservations this month.</p>
          } @else {
            @for (b of thisMonthReservations(); track b.id) {
              <div class="reservation-row">
                <span class="reservation-guest">{{ b.guestName }}</span>
                <span class="reservation-dates">{{ b.checkIn | date:'MMM d' }} – {{ b.checkOut | date:'MMM d' }}</span>
                <span class="reservation-nights">{{ b.nights }}n</span>
                <span class="reservation-total">{{ b.currency }} {{ b.total }}</span>
                <span class="status-badge status-badge--{{ b.status }}">{{ b.status }}</span>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-page { max-width: 860px; margin: 40px auto; padding: 0 24px; }
    .calendar-page__header { margin-bottom: 24px; }
    .calendar-page__title { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .calendar-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .calendar-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .calendar-month { font-size: 1.1rem; font-weight: 700; }
    .nav-btn { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 8px; background: none; font-size: 1.2rem; cursor: pointer; &:hover { border-color: var(--primary); } &:focus-visible { outline: 2px solid var(--primary); } }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .calendar-day-header { text-align: center; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); padding: 4px; }
    .calendar-cell { min-height: 56px; padding: 6px; border-radius: 8px; position: relative; border: 1px solid transparent; &--other-month { opacity: 0.35; } &--booked { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); } &--today .calendar-cell__num { background: var(--primary); color: #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; } }
    .calendar-cell__num { font-size: 0.85rem; font-weight: 500; }
    .booking-dot { display: inline-block; font-size: 0.6rem; font-weight: 700; padding: 1px 4px; border-radius: 4px; margin-top: 4px; }
    .booking-dot--in { background: #dcfce7; color: #15803d; }
    .booking-dot--out { background: #fef9c3; color: #854d0e; }
    .legend { display: flex; gap: 16px; margin-top: 12px; font-size: 0.82rem; color: var(--text-muted); }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; &--stay { background: rgba(59,130,246,0.2); } }
    .reservations-list { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
    .reservations-title { font-size: 1rem; font-weight: 700; margin: 0 0 16px; }
    .reservation-row { display: flex; align-items: center; gap: 16px; padding: 10px 0; border-top: 1px solid var(--border); font-size: 0.88rem; &:first-of-type { border-top: none; } }
    .reservation-guest { font-weight: 600; flex: 1; }
    .reservation-dates { color: var(--text-muted); }
    .reservation-nights { color: var(--text-muted); min-width: 28px; }
    .reservation-total { font-weight: 600; min-width: 80px; }
    .status-badge { padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
    .status-badge--pending { background: #fffbeb; color: #92400e; }
    .status-badge--confirmed { background: #f0fdf4; color: #15803d; }
    .status-badge--cancelled { background: #fef2f2; color: #b91c1c; }
    .empty-msg { color: var(--text-muted); font-size: 0.9rem; }
  `]
})
export class BookingCalendarComponent implements OnInit {
  readonly bookingStore = inject(BookingStore);
  readonly authStore = inject(AuthStore);

  readonly WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly currentDate = signal(new Date());

  readonly calendarCells = computed(() => {
    const date = this.currentDate();
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const today = new Date();

    const cells: Array<{
      date: Date;
      inMonth: boolean;
      isToday: boolean;
      booking: Booking | null;
      isCheckIn: boolean;
      isCheckOut: boolean;
    }> = [];

    const leadingDays = getDay(start);
    for (let i = leadingDays - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(d.getDate() - i - 1);
      cells.push({ date: d, inMonth: false, isToday: false, booking: null, isCheckIn: false, isCheckOut: false });
    }

    const bookings = this.bookingStore.confirmedReservations();
    for (const day of days) {
      const booking = bookings.find(b =>
        isWithinInterval(day, { start: b.checkIn, end: b.checkOut }) ||
        isSameDay(day, b.checkIn) || isSameDay(day, b.checkOut)
      ) ?? null;
      cells.push({
        date: day,
        inMonth: true,
        isToday: isSameDay(day, today),
        booking,
        isCheckIn: booking ? isSameDay(day, booking.checkIn) : false,
        isCheckOut: booking ? isSameDay(day, booking.checkOut) : false
      });
    }

    return cells;
  });

  readonly thisMonthReservations = computed(() => {
    const date = this.currentDate();
    return this.bookingStore.confirmedReservations().filter(b =>
      isSameMonth(b.checkIn, date) || isSameMonth(b.checkOut, date)
    );
  });

  ngOnInit(): void {
    this.bookingStore.loadHostBookings();
  }

  prevMonth(): void { this.currentDate.update(d => subMonths(d, 1)); }
  nextMonth(): void { this.currentDate.update(d => addMonths(d, 1)); }
}
