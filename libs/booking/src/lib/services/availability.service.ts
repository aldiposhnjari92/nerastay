import { inject, Injectable } from '@angular/core';
import {
  Firestore, collection, getDocs, doc, setDoc, deleteDoc, query, where
} from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { generateDateRange, toISODateString } from '@nerastay/shared';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private firestore = inject(Firestore);

  getBlockedDates(listingId: string): Observable<Date[]> {
    const ref = collection(this.firestore, `listings/${listingId}/availability`);
    const q = query(ref, where('blocked', '==', true));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.flatMap(d => {
        const data = d.data() as { checkIn: string; checkOut: string };
        return generateDateRange(new Date(data['checkIn']), new Date(data['checkOut'])).map(s => new Date(s));
      }))
    );
  }

  isAvailable(listingId: string, checkIn: Date, checkOut: Date): Observable<boolean> {
    const ref = collection(this.firestore, `listings/${listingId}/availability`);
    const inStr = toISODateString(checkIn);
    const outStr = toISODateString(checkOut);
    const q = query(ref,
      where('blocked', '==', true),
      where('checkIn', '<', outStr),
      where('checkOut', '>', inStr)
    );
    return from(getDocs(q)).pipe(map(snap => snap.empty));
  }

  async blockDates(listingId: string, bookingId: string, checkIn: Date, checkOut: Date): Promise<void> {
    const ref = doc(this.firestore, `listings/${listingId}/availability/${bookingId}`);
    await setDoc(ref, {
      blocked: true,
      bookingId,
      checkIn: toISODateString(checkIn),
      checkOut: toISODateString(checkOut)
    });
  }

  async unblockDates(listingId: string, bookingId: string): Promise<void> {
    const ref = doc(this.firestore, `listings/${listingId}/availability/${bookingId}`);
    await deleteDoc(ref);
  }
}
