import { Component, input, output, computed, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ns-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stars"
         role="group"
         [attr.aria-label]="'Rating: ' + value() + ' out of 5'"
         [class.stars--interactive]="!readonly()">
      @for (star of stars(); track $index) {
        @if (readonly()) {
          <span class="star" [class.star--filled]="star" aria-hidden="true">
            {{ star ? '★' : '☆' }}
          </span>
        } @else {
          <button
            type="button"
            class="star star--btn"
            [class.star--filled]="($index + 1) <= (hovered() ?? value())"
            (mouseenter)="hovered.set($index + 1)"
            (mouseleave)="hovered.set(null)"
            (click)="select($index + 1)"
            [attr.aria-label]="'Rate ' + ($index + 1) + ' star' + ($index > 0 ? 's' : '')"
            [attr.aria-pressed]="($index + 1) === value()">
            ★
          </button>
        }
      }
      @if (showCount() && count() > 0) {
        <span class="stars__count">({{ count() }})</span>
      }
    </div>
  `,
  styles: [`
    .stars { display: inline-flex; align-items: center; gap: 1px; font-size: 1.1rem; }
    .star { color: #d1d5db; transition: color 0.1s; }
    .star--filled { color: #f59e0b; }
    .star--btn { background: none; border: none; cursor: pointer; padding: 0; font-size: inherit; &:focus-visible { outline: 2px solid var(--primary); border-radius: 2px; } }
    .stars--interactive .star--btn:hover { color: #f59e0b; }
    .stars__count { font-size: 0.82rem; color: var(--text-muted); margin-left: 4px; }
  `]
})
export class StarRatingComponent {
  readonly value = input<number>(0);
  readonly count = input(0);
  readonly readonly = input(true);
  readonly showCount = input(true);
  readonly rated = output<number>();

  protected readonly hovered = signal<number | null>(null);

  readonly stars = computed(() =>
    Array.from({ length: 5 }, (_, i) => (i + 1) <= Math.round(this.value() ?? 0))
  );

  select(rating: number): void {
    this.rated.emit(rating);
  }
}
