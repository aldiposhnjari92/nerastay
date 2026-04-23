import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, query, orderBy, limit, startAfter, serverTimestamp, QueryDocumentSnapshot, DocumentData, increment, runTransaction } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Review, ReviewFormData } from '@nerastay/shared';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private firestore = inject(Firestore);

  async createReview(data: ReviewFormData & { authorId: string; authorName: string; authorPhoto: string | null }): Promise<string> {
    const reviewRef = collection(this.firestore, `listings/${data.listingId}/reviews`);
    const listingRef = doc(this.firestore, `listings/${data.listingId}`);

    const docRef = await addDoc(reviewRef, {
      listingId: data.listingId,
      bookingId: data.bookingId ?? null,
      authorId: data.authorId,
      authorName: data.authorName,
      authorPhoto: data.authorPhoto,
      rating: data.rating,
      comment: data.comment,
      photos: data.photos ?? [],
      ownerReply: null,
      ownerRepliedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await runTransaction(this.firestore, async tx => {
      const listingSnap = await tx.get(listingRef);
      if (!listingSnap.exists()) return;
      const listing = listingSnap.data();
      const currentCount = (listing['reviewCount'] as number) ?? 0;
      const currentRating = (listing['rating'] as number) ?? 0;
      const newCount = currentCount + 1;
      const newRating = (currentRating * currentCount + data.rating) / newCount;
      tx.update(listingRef, {
        rating: Math.round(newRating * 10) / 10,
        reviewCount: newCount
      });
    });

    return docRef.id;
  }

  getReviews(listingId: string, pageSize = 10, after?: QueryDocumentSnapshot<DocumentData>): Observable<{ reviews: Review[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    const ref = collection(this.firestore, `listings/${listingId}/reviews`);
    const constraints = after
      ? [orderBy('createdAt', 'desc'), startAfter(after), limit(pageSize)]
      : [orderBy('createdAt', 'desc'), limit(pageSize)];
    const q = query(ref, ...constraints);
    return from(getDocs(q)).pipe(
      map(snap => ({
        reviews: snap.docs.map(d => this.fromDoc(d.id, d.data())),
        lastDoc: snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null
      }))
    );
  }

  async addOwnerReply(listingId: string, reviewId: string, reply: string): Promise<void> {
    const ref = doc(this.firestore, `listings/${listingId}/reviews/${reviewId}`);
    await updateDoc(ref, {
      ownerReply: reply,
      ownerRepliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private fromDoc(id: string, data: Record<string, unknown>): Review {
    return {
      id,
      listingId: data['listingId'] as string,
      bookingId: data['bookingId'] as string | null,
      authorId: data['authorId'] as string,
      authorName: data['authorName'] as string,
      authorPhoto: data['authorPhoto'] as string | null,
      rating: data['rating'] as number,
      comment: data['comment'] as string,
      photos: (data['photos'] as string[]) ?? [],
      ownerReply: data['ownerReply'] as string | null,
      ownerRepliedAt: data['ownerRepliedAt'] ? (data['ownerRepliedAt'] as { toDate(): Date }).toDate() : null,
      createdAt: (data['createdAt'] as { toDate(): Date })?.toDate() ?? new Date(),
      updatedAt: (data['updatedAt'] as { toDate(): Date })?.toDate() ?? new Date()
    };
  }
}
