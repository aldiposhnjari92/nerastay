import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StarRatingComponent, PhotoUploadComponent, SpinnerComponent } from '@nerastay/ui';
import { ReviewsStore } from '../../store/reviews.store';
import { minLengthTrimmed } from '@nerastay/shared';

@Component({
  selector: 'ns-review-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StarRatingComponent, PhotoUploadComponent, SpinnerComponent],
  template: `
    <form class="review-form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <h3 class="form-title">Write a Review</h3>

      <div class="form-field">
        <label class="form-label">Your Rating <span aria-hidden="true">*</span></label>
        <ns-star-rating
          [value]="form.get('rating')?.value ?? 0"
          (rated)="form.get('rating')?.setValue($event); form.get('rating')?.markAsTouched()" />
        @if (form.get('rating')?.invalid && form.get('rating')?.touched) {
          <p class="field-error" role="alert">Please select a rating.</p>
        }
      </div>

      <div class="form-field">
        <label for="comment" class="form-label">Your Review <span aria-hidden="true">*</span></label>
        <textarea id="comment" class="input input--textarea" formControlName="comment"
                  rows="4" placeholder="Share your experience…"
                  [attr.aria-invalid]="form.get('comment')?.invalid && form.get('comment')?.touched"></textarea>
        @if (form.get('comment')?.invalid && form.get('comment')?.touched) {
          <p class="field-error" role="alert">Please write at least 20 characters.</p>
        }
      </div>

      <div class="form-field">
        <span class="form-label">Photos <span class="optional">(optional)</span></span>
        <ns-photo-upload [maxFiles]="3" (filesSelected)="onPhotos($event)" />
      </div>

      @if (store.error()) {
        <p class="form-error" role="alert">{{ store.error() }}</p>
      }

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" class="btn btn--primary" [disabled]="form.invalid || store.submitting()">
          @if (store.submitting()) { <ns-spinner /> } @else { Submit Review }
        </button>
      </div>
    </form>
  `,
  styles: [`
    .review-form { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
    .form-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 20px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .optional { font-weight: 400; color: var(--text-muted); }
    .input--textarea { resize: vertical; min-height: 100px; }
    .field-error, .form-error { font-size: 0.8rem; color: var(--error, #dc2626); margin: 0; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
  `]
})
export class ReviewFormComponent {
  readonly listingId = input.required<string>();
  readonly bookingId = input<string | null>(null);
  readonly submitted = output<void>();
  readonly cancelled = output<void>();

  readonly store = inject(ReviewsStore);
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, minLengthTrimmed(20)]],
    photos: [[] as File[]]
  });

  onPhotos(files: File[]): void { this.form.patchValue({ photos: files }); }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { rating, comment } = this.form.value;
    const success = await this.store.submitReview({
      listingId: this.listingId(),
      bookingId: this.bookingId() ?? undefined,
      rating: rating!,
      comment: comment!.trim()
    });
    if (success) this.submitted.emit();
  }
}
