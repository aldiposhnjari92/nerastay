import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, addDoc, doc, getDoc, getDocs,
  updateDoc, query, where, orderBy, serverTimestamp,
  DocumentData, QueryDocumentSnapshot
} from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { Booking, BookingFormData, nightsBetween } from '@nerastay/shared';

interface CreateBookingInput extends BookingFormData {
  listingName: string;
  listingPhoto: string | null;
  hostId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  pricePerNight: number;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private firestore = inject(Firestore);

  async createBooking(data: CreateBookingInput): Promise<string> {
    const nights = nightsBetween(data.checkIn, data.checkOut);
    const subtotal = nights * data.pricePerNight;
    const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + serviceFee;

    const ref = collection(this.firestore, 'bookings');
    const docRef = await addDoc(ref, {
      listingId: data.listingId,
      listingName: data.listingName,
      listingPhoto: data.listingPhoto,
      hostId: data.hostId,
      guestId: data.guestId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      checkIn: data.checkIn.toISOString(),
      checkOut: data.checkOut.toISOString(),
      guests: data.guests,
      nights,
      pricePerNight: data.pricePerNight,
      subtotal,
      serviceFee,
      total,
      currency: data.currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      specialRequests: data.specialRequests ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  getBooking(id: string): Observable<Booking | null> {
    const ref = doc(this.firestore, `bookings/${id}`);
    return from(getDoc(ref)).pipe(
      map(snap => snap.exists() ? this.fromDoc(snap.id, snap.data()) : null)
    );
  }

  getGuestBookings(guestId: string): Observable<Booking[]> {
    const ref = collection(this.firestore, 'bookings');
    const q = query(ref, where('guestId', '==', guestId), orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => this.fromDoc(d.id, d.data())))
    );
  }

  getHostBookings(hostId: string): Observable<Booking[]> {
    const ref = collection(this.firestore, 'bookings');
    const q = query(ref, where('hostId', '==', hostId), orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => this.fromDoc(d.id, d.data())))
    );
  }

  async updateStatus(bookingId: string, status: Booking['status']): Promise<void> {
    const ref = doc(this.firestore, `bookings/${bookingId}`);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  }

  async markPaid(bookingId: string, stripeSessionId: string): Promise<void> {
    const ref = doc(this.firestore, `bookings/${bookingId}`);
    await updateDoc(ref, {
      paymentStatus: 'paid',
      status: 'confirmed',
      stripeSessionId,
      updatedAt: serverTimestamp()
    });
  }

  private fromDoc(id: string, data: DocumentData): Booking {
    return {
      id,
      listingId: data['listingId'] as string,
      listingName: data['listingName'] as string,
      listingPhoto: data['listingPhoto'] as string | null,
      hostId: data['hostId'] as string,
      guestId: data['guestId'] as string,
      guestName: data['guestName'] as string,
      guestEmail: data['guestEmail'] as string,
      checkIn: new Date(data['checkIn'] as string),
      checkOut: new Date(data['checkOut'] as string),
      guests: data['guests'] as number,
      nights: data['nights'] as number,
      pricePerNight: data['pricePerNight'] as number,
      subtotal: data['subtotal'] as number,
      serviceFee: data['serviceFee'] as number,
      total: data['total'] as number,
      currency: data['currency'] as string,
      status: data['status'] as Booking['status'],
      paymentStatus: data['paymentStatus'] as Booking['paymentStatus'],
      stripeSessionId: data['stripeSessionId'] as string | undefined,
      specialRequests: data['specialRequests'] as string | null,
      createdAt: (data['createdAt'] as { toDate(): Date })?.toDate() ?? new Date(),
      updatedAt: (data['updatedAt'] as { toDate(): Date })?.toDate() ?? new Date()
    };
  }
}
