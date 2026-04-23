import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { addMonths, startOfMonth, getDaysInMonth, getDay, format, isBefore, isAfter, isSameDay, parseISO, startOfDay } from 'date-fns';

export interface DateRange {
  checkIn: Date;
  checkOut: Date;
}

@Component({
  selector: 'ns-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calendar" role="group" [attr.aria-label]="'Date range picker'">
      <div class="calendar__nav">
        <button type="button" class="calendar__nav-btn" (click)="prevMonth()" aria-label="Previous month">‹</button>
        <span class="calendar__month-label">{{ monthLabel() }}</span>
        <button type="button" class="calendar__nav-btn" (click)="nextMonth()" aria-label="Next month">›</button>
      </div>

      <div class="calendar__weekdays" aria-hidden="true">
        @for (day of weekdays; track day) {
          <span class="calendar__weekday">{{ day }}</span>
        }
      </div>

      <div class="calendar__grid">
        @for (blank of leadingBlanks(); track $index) {
          <span class="calendar__cell calendar__cell--blank"></span>
        }
        @for (day of daysInMonth(); track day) {
          <button
            type="button"
            class="calendar__cell"
            [class.calendar__cell--today]="isToday(day)"
            [class.calendar__cell--selected-start]="isStart(day)"
            [class.calendar__cell--selected-end]="isEnd(day)"
            [class.calendar__cell--in-range]="isInRange(day)"
            [class.calendar__cell--blocked]="isBlocked(day)"
            [disabled]="isBlocked(day) || isPast(day)"
            (click)="selectDay(day)"
            [attr.aria-label]="dayLabel(day)"
            [attr.aria-pressed]="isStart(day) || isEnd(day)">
            {{ day }}
          </button>
        }
      </div>

      @if (selectionStart() && !selectionEnd()) {
        <p class="calendar__hint">Now select your check-out date.</p>
      }
    </div>
  `,
  styleUrl: 'date-range-picker.component.scss'
})
export class DateRangePickerComponent {
  blockedDates = input<string[]>([]);
  minDate = input<Date>(new Date());
  rangeSelected = output<DateRange>();

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly viewMonth = signal(startOfMonth(new Date()));
  readonly selectionStart = signal<Date | null>(null);
  readonly selectionEnd = signal<Date | null>(null);

  readonly monthLabel = computed(() => format(this.viewMonth(), 'MMMM yyyy'));
  readonly leadingBlanks = computed(() => Array(getDay(this.viewMonth())).fill(0));
  readonly daysInMonth = computed(() => Array.from({ length: getDaysInMonth(this.viewMonth()) }, (_, i) => i + 1));

  dateForDay(day: number): Date {
    const d = new Date(this.viewMonth());
    d.setDate(day);
    return startOfDay(d);
  }

  isBlocked(day: number): boolean {
    const d = this.dateForDay(day);
    return this.blockedDates().includes(format(d, 'yyyy-MM-dd'));
  }

  isPast(day: number): boolean {
    return isBefore(this.dateForDay(day), startOfDay(this.minDate()));
  }

  isToday(day: number): boolean {
    return isSameDay(this.dateForDay(day), new Date());
  }

  isStart(day: number): boolean {
    const s = this.selectionStart();
    return s ? isSameDay(this.dateForDay(day), s) : false;
  }

  isEnd(day: number): boolean {
    const e = this.selectionEnd();
    return e ? isSameDay(this.dateForDay(day), e) : false;
  }

  isInRange(day: number): boolean {
    const s = this.selectionStart(), e = this.selectionEnd();
    if (!s || !e) return false;
    const d = this.dateForDay(day);
    return isAfter(d, s) && isBefore(d, e);
  }

  dayLabel(day: number): string {
    return format(this.dateForDay(day), 'EEEE, MMMM d, yyyy');
  }

  selectDay(day: number): void {
    const d = this.dateForDay(day);
    const start = this.selectionStart();
    if (!start || (start && this.selectionEnd())) {
      this.selectionStart.set(d);
      this.selectionEnd.set(null);
    } else if (isAfter(d, start)) {
      this.selectionEnd.set(d);
      this.rangeSelected.emit({ checkIn: start, checkOut: d });
    } else {
      this.selectionStart.set(d);
      this.selectionEnd.set(null);
    }
  }

  prevMonth(): void { this.viewMonth.update(m => addMonths(m, -1)); }
  nextMonth(): void { this.viewMonth.update(m => addMonths(m, 1)); }
}
