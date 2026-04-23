import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { indexListing, removeListing } from './algolia.util';
import { sendEmail } from './sendgrid.util';

export const onListingStatusChanged = onDocumentUpdated(
  'listings/{listingId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const statusChanged = before['status'] !== after['status'];
    if (!statusChanged) return;

    const listingId = event.params.listingId;
    const newStatus = after['status'] as string;

    if (newStatus === 'approved') {
      await indexListing({ id: listingId, ...after });

      const hostSnap = await admin.firestore().doc(`users/${after['hostId']}`).get();
      const hostEmail = hostSnap.data()?.['email'] as string | undefined;
      if (hostEmail) {
        await sendEmail({
          to: hostEmail,
          subject: `Your listing "${after['name']}" has been approved!`,
          html: `
            <h2>Great news! Your listing is live.</h2>
            <p>Your listing <strong>${after['name']}</strong> has been approved and is now visible to travelers.</p>
            <p><a href="https://nerastay.web.app/listings/${listingId}">View your listing</a></p>
          `
        });
      }
    } else if (newStatus === 'rejected') {
      await removeListing(listingId).catch(() => {});

      const hostSnap = await admin.firestore().doc(`users/${after['hostId']}`).get();
      const hostEmail = hostSnap.data()?.['email'] as string | undefined;
      if (hostEmail) {
        await sendEmail({
          to: hostEmail,
          subject: `Update on your listing "${after['name']}"`,
          html: `
            <h2>Listing Not Approved</h2>
            <p>Unfortunately, your listing <strong>${after['name']}</strong> did not meet our guidelines.</p>
            <p>Please review our <a href="https://nerastay.web.app/guidelines">hosting guidelines</a> and resubmit.</p>
          `
        });
      }
    }
  }
);
