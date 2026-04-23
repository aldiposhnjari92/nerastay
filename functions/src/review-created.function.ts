import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

export const onReviewCreated = onDocumentCreated(
  'listings/{listingId}/reviews/{reviewId}',
  async (event) => {
    const review = event.data?.data();
    if (!review) return;

    const listingId = event.params.listingId;

    const listingRef = admin.firestore().doc(`listings/${listingId}`);
    await admin.firestore().runTransaction(async tx => {
      const listingSnap = await tx.get(listingRef);
      if (!listingSnap.exists) return;
      const listing = listingSnap.data()!;
      const count = (listing['reviewCount'] as number) ?? 0;
      const avg = (listing['rating'] as number) ?? 0;
      const newCount = count + 1;
      const newAvg = Math.round(((avg * count + (review['rating'] as number)) / newCount) * 10) / 10;
      tx.update(listingRef, { rating: newAvg, reviewCount: newCount });

      await admin.firestore().collection('notifications').add({
        userId: listing['hostId'],
        type: 'new_review',
        title: 'New Review',
        body: `${review['authorName']} left a ${review['rating']}★ review on ${listing['name']}`,
        data: { listingId, reviewId: event.params.reviewId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const hostSnap = await admin.firestore().doc(`users/${listing['hostId']}`).get();
      const fcmToken = hostSnap.data()?.['fcmToken'] as string | undefined;
      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: 'New Review',
            body: `${review['authorName']} left a ${review['rating']}★ review on ${listing['name']}`
          },
          data: { listingId, type: 'new_review' }
        }).catch(() => {});
      }
    });
  }
);
