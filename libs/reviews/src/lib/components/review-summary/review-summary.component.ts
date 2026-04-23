import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StarRatingComponent } from '@nerastay/ui';

@Component({
  selector: 'ns-review-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, StarRatingComponent],
  template: `
    <div class="review-summary" aria-label="Rating summary">
      <div class="summary-score">
        <span class="score-num">{{ averageRating() | number:'1.1-1' }}</span>
        <ns-star-rating [value]="averageRating()" [readonly]="true" />
        <span class="score-count">{{ reviewCount() }} review{{ reviewCount() !== 1 ? 's' : '' }}</span>
      </div>

      <div class="distribution" aria-label="Rating distribution">
        @for (bar of bars(); track $index) {
          <div class="bar-row">
            <span class="bar-label">{{ bar.stars }}★</span>
            <div class="bar-track" role="meter" [attr.aria-valuenow]="bar.pct" aria-valuemin="0" aria-valuemax="100">
              <div class="bar-fill" [style.width.%]="bar.pct"></div>
            </div>
            <span class="bar-count">{{ bar.count }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .review-summary { display: flex; gap: 32px; align-items: flex-start; padding: 20px 0; }
    .summary-score { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 100px; }
    .score-num { font-size: 2.8rem; font-weight: 800; line-height: 1; }
    .score-count { font-size: 0.82rem; color: var(--text-muted); }
    .distribution { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .bar-row { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
    .bar-label { width: 20px; text-align: right; color: var(--text-muted); font-weight: 600; }
    .bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s; }
    .bar-count { width: 20px; color: var(--text-muted); }
  `]
})
export class ReviewSummaryComponent {
  readonly averageRating = input(0);
  readonly reviewCount = input(0);
  readonly distribution = input<number[]>([0, 0, 0, 0, 0]);

  readonly bars = computed(() =>
    this.distribution().map((count, i) => ({
      stars: i + 1,
      count,
      pct: this.reviewCount() > 0 ? Math.round((count / this.reviewCount()) * 100) : 0
    })).reverse()
  );
}
