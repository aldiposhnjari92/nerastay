import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Firestore, collectionGroup, getDocs, doc, deleteDoc, orderBy, query, limit } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { SpinnerComponent, StarRatingComponent } from '@nerastay/ui';
import { Review } from '@nerastay/shared';

@Component({
  selector: 'ns-review-moderation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, SpinnerComponent, StarRatingComponent],
  template: `
    <div class="reviews-mod">
      <h1 class="reviews-mod__title">Review Moderation</h1>

      @if (loading()) {
        <ns-spinner label="Loading reviews…" />
      } @else if (reviews().length === 0) {
        <p class="empty">No reviews to moderate.</p>
      } @else {
        <div class="review-list">
          @for (review of reviews(); track review.id) {
            <div class="review-item">
              <div class="review-item__header">
                <div class="review-meta">
                  <span class="review-author">{{ review.authorName }}</span>
                  <ns-star-rating [value]="review.rating" [readonly]="true" />
                  <span class="review-date">{{ review.createdAt | date:'mediumDate' }}</span>
                </div>
                <button class="delete-btn" [disabled]="deletingId() === review.id"
                        (click)="deleteReview(review)">
                  Delete
                </button>
              </div>
              <p class="review-comment">{{ review.comment }}</p>
              @if (review.photos.length > 0) {
                <div class="review-photos">
                  @for (photo of review.photos; track photo) {
                    <img [src]="photo" alt="Review photo" class="review-photo" />
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .reviews-mod { padding: 32px; }
    .reviews-mod__title { font-size: 1.6rem; font-weight: 800; margin: 0 0 24px; }
    .review-list { display: flex; flex-direction: column; gap: 12px; }
    .review-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; }
    .review-item__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 12px; }
    .review-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .review-author { font-weight: 700; font-size: 0.9rem; }
    .review-date { font-size: 0.78rem; color: #64748b; }
    .review-comment { color: #334155; font-size: 0.88rem; line-height: 1.6; margin: 0; }
    .review-photos { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .review-photo { width: 70px; height: 52px; border-radius: 6px; object-fit: cover; }
    .delete-btn { padding: 5px 14px; border-radius: 8px; border: 1.5px solid #dc2626; color: #dc2626; background: transparent; font-size: 0.8rem; font-weight: 600; cursor: pointer; flex-shrink: 0; &:hover { background: #fef2f2; } &:disabled { opacity: 0.4; cursor: not-allowed; } &:focus-visible { outline: 2px solid #3b82f6; } }
    .empty { color: #64748b; padding: 40px; text-align: center; }
  `]
})
export class ReviewModerationComponent implements OnInit {
  private firestore = inject(Firestore);
  readonly loading = signal(true);
  readonly reviews = signal<Review[]>([]);
  readonly deletingId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const q = query(collectionGroup(this.firestore, 'reviews'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      this.reviews.set(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          listingId: data['listingId'] as string,
          bookingId: data['bookingId'] as string | null,
          authorId: data['authorId'] as string,
          authorName: data['authorName'] as string,
          authorPhoto: data['authorPhoto'] as string | null,
          rating: data['rating'] as number,
          comment: data['comment'] as string,
          photos: (data['photos'] as string[]) ?? [],
          ownerReply: data['ownerReply'] as string | null,
          ownerRepliedAt: null,
          createdAt: (data['createdAt'] as { toDate(): Date })?.toDate() ?? new Date(),
          updatedAt: (data['updatedAt'] as { toDate(): Date })?.toDate() ?? new Date()
        } satisfies Review;
      }));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteReview(review: Review): Promise<void> {
    this.deletingId.set(review.id);
    await deleteDoc(doc(this.firestore, `listings/${review.listingId}/reviews/${review.id}`));
    this.reviews.update(rs => rs.filter(r => r.id !== review.id));
    this.deletingId.set(null);
  }
}
