import { Component, inject, input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StarRatingComponent, AvatarComponent, InfiniteScrollDirective, SpinnerComponent } from '@nerastay/ui';
import { AuthStore } from '@nerastay/auth';
import { ReviewsStore } from '../../store/reviews.store';
import { ReviewFormComponent } from '../review-form/review-form.component';
import { OwnerReplyFormComponent } from '../owner-reply-form/owner-reply-form.component';
import { ReviewSummaryComponent } from '../review-summary/review-summary.component';
import { Review } from '@nerastay/shared';

@Component({
  selector: 'ns-review-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, StarRatingComponent, AvatarComponent,
    InfiniteScrollDirective, SpinnerComponent,
    ReviewFormComponent, OwnerReplyFormComponent, ReviewSummaryComponent
  ],
  template: `
    <section class="reviews" id="reviews" aria-label="Reviews">
      <div class="reviews__header">
        <h2 class="reviews__title">Reviews</h2>
        @if (authStore.isLoggedIn() && !showForm()) {
          <button class="btn btn--outline btn--sm" (click)="showForm.set(true)">Write a Review</button>
        }
      </div>

      @if (store.reviews().length > 0 || store.averageRating() > 0) {
        <ns-review-summary
          [averageRating]="store.averageRating()"
          [reviewCount]="store.reviews().length"
          [distribution]="store.ratingDistribution()" />
      }

      @if (showForm()) {
        <ns-review-form
          [listingId]="listingId()"
          (submitted)="onReviewSubmitted()"
          (cancelled)="showForm.set(false)" />
      }

      @if (store.loading() && store.reviews().length === 0) {
        <ns-spinner label="Loading reviews…" />
      } @else if (store.reviews().length === 0) {
        <p class="empty-reviews">No reviews yet. Be the first to review!</p>
      } @else {
        <div class="review-cards" (nsInfiniteScroll)="onLoadMore()">
          @for (review of store.reviews(); track review.id) {
            <article class="review-card">
              <div class="review-card__header">
                <ns-avatar [name]="review.authorName" [photoUrl]="review.authorPhoto ?? undefined" size="sm" />
                <div class="review-meta">
                  <span class="review-author">{{ review.authorName }}</span>
                  <span class="review-date">{{ review.createdAt | date:'mediumDate' }}</span>
                </div>
                <ns-star-rating [value]="review.rating" [readonly]="true" />
              </div>

              <p class="review-comment">{{ review.comment }}</p>

              @if (review.photos.length > 0) {
                <div class="review-photos">
                  @for (photo of review.photos; track photo) {
                    <img [src]="photo" alt="Review photo" class="review-photo" />
                  }
                </div>
              }

              @if (review.ownerReply) {
                <div class="owner-reply">
                  <span class="owner-reply__label">Owner's response</span>
                  <p class="owner-reply__text">{{ review.ownerReply }}</p>
                  <span class="owner-reply__date">{{ review.ownerRepliedAt | date:'mediumDate' }}</span>
                </div>
              } @else if (authStore.isOwner() && !replyingTo()) {
                <button class="btn btn--ghost btn--sm reply-btn"
                        (click)="replyingTo.set(review.id)">
                  Reply
                </button>
              }

              @if (replyingTo() === review.id) {
                <ns-owner-reply-form
                  [listingId]="listingId()"
                  [reviewId]="review.id"
                  (submitted)="replyingTo.set(null)"
                  (cancelled)="replyingTo.set(null)" />
              }
            </article>
          }

          @if (store.loading()) { <ns-spinner /> }
          @if (!store.hasMore() && store.reviews().length > 0) {
            <p class="no-more">All reviews loaded.</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .reviews { padding: 32px 0; }
    .reviews__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .reviews__title { font-size: 1.3rem; font-weight: 800; margin: 0; }
    .empty-reviews { color: var(--text-muted); font-size: 0.9rem; }
    .review-cards { display: flex; flex-direction: column; gap: 20px; margin-top: 24px; }
    .review-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .review-card__header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .review-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .review-author { font-weight: 700; font-size: 0.9rem; }
    .review-date { font-size: 0.78rem; color: var(--text-muted); }
    .review-comment { margin: 0; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary); }
    .review-photos { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .review-photo { width: 80px; height: 60px; border-radius: 8px; object-fit: cover; }
    .owner-reply { background: var(--bg); border-radius: 8px; padding: 12px 16px; margin-top: 12px; border-left: 3px solid var(--primary); }
    .owner-reply__label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary); display: block; margin-bottom: 6px; }
    .owner-reply__text { margin: 0 0 4px; font-size: 0.88rem; }
    .owner-reply__date { font-size: 0.75rem; color: var(--text-muted); }
    .reply-btn { margin-top: 8px; }
    .no-more { text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 16px 0; }
  `]
})
export class ReviewListComponent implements OnInit {
  readonly listingId = input.required<string>();
  readonly store = inject(ReviewsStore);
  readonly authStore = inject(AuthStore);

  readonly showForm = signal(false);
  readonly replyingTo = signal<string | null>(null);

  ngOnInit(): void {
    this.store.loadReviews(this.listingId(), true);
  }

  onLoadMore(): void {
    if (!this.store.loading() && this.store.hasMore()) {
      this.store.loadReviews(this.listingId());
    }
  }

  onReviewSubmitted(): void {
    this.showForm.set(false);
  }
}
