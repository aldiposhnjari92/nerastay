import { Component, inject, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { SpinnerComponent } from '@nerastay/ui';
import { ReviewsStore } from '../../store/reviews.store';

@Component({
  selector: 'ns-owner-reply-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="reply-form">
      <label [for]="inputId" class="reply-label">Your Response</label>
      <textarea [id]="inputId" class="input input--textarea" [formControl]="replyCtrl"
                rows="3" placeholder="Reply to this review…"
                [attr.aria-invalid]="replyCtrl.invalid && replyCtrl.touched"></textarea>
      @if (replyCtrl.invalid && replyCtrl.touched) {
        <p class="field-error" role="alert">Please write at least 10 characters.</p>
      }
      <div class="reply-actions">
        <button type="button" class="btn btn--ghost btn--sm" (click)="cancelled.emit()">Cancel</button>
        <button type="button" class="btn btn--primary btn--sm"
                [disabled]="replyCtrl.invalid || store.submitting()"
                (click)="onSubmit()">
          @if (store.submitting()) { <ns-spinner /> } @else { Post Reply }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reply-form { background: var(--bg); border-radius: 8px; padding: 12px; margin-top: 8px; }
    .reply-label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px; }
    .input--textarea { resize: vertical; min-height: 72px; }
    .field-error { font-size: 0.78rem; color: var(--error, #dc2626); margin: 4px 0 0; }
    .reply-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class OwnerReplyFormComponent {
  readonly listingId = input.required<string>();
  readonly reviewId = input.required<string>();
  readonly submitted = output<void>();
  readonly cancelled = output<void>();

  readonly store = inject(ReviewsStore);
  readonly replyCtrl = new FormControl('', [Validators.required, Validators.minLength(10)]);
  readonly inputId = `reply-${Math.random().toString(36).slice(2)}`;

  async onSubmit(): Promise<void> {
    if (this.replyCtrl.invalid) { this.replyCtrl.markAsTouched(); return; }
    await this.store.addOwnerReply(this.listingId(), this.reviewId(), this.replyCtrl.value!.trim());
    this.submitted.emit();
  }
}
