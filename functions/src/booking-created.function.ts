import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendEmail } from './sendgrid.util';

export const onBookingCreated = onDocumentCreated(
  'bookings/{bookingId}',
  async (event) => {
    const booking = event.data?.data();
    if (!booking) return;

    const bookingId = event.params.bookingId;

    await admin.firestore().collection('notifications').add({
      userId: booking['hostId'],
      type: 'booking_request',
      title: 'New Booking Request',
      body: `${booking['guestName']} wants to book ${booking['listingName']}`,
      data: { bookingId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const hostSnap = await admin.firestore().doc(`users/${booking['hostId']}`).get();
    const host = hostSnap.data();
    const fcmToken = host?.['fcmToken'] as string | undefined;

    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'New Booking Request',
          body: `${booking['guestName']} wants to book ${booking['listingName']}`
        },
        data: { bookingId, type: 'booking_request' }
      }).catch(() => {});
    }

    const hostEmail = host?.['email'] as string | undefined;
    if (hostEmail) {
      const checkIn = new Date(booking['checkIn']).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const checkOut = new Date(booking['checkOut']).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      await sendEmail({
        to: hostEmail,
        subject: `New booking request for ${booking['listingName']}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>${booking['guestName']}</strong> has requested to book <strong>${booking['listingName']}</strong>.</p>
          <ul>
            <li>Check-in: ${checkIn}</li>
            <li>Check-out: ${checkOut}</li>
            <li>Guests: ${booking['guests']}</li>
            <li>Total: ${booking['currency']} ${booking['total']}</li>
          </ul>
          <p><a href="https://nerastay.web.app/bookings/${bookingId}">View booking details</a></p>
        `
      });
    }
  }
);
