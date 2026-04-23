import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, orderBy, startAt, endAt, getDocs, where } from 'firebase/firestore';
import { Observable, from, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GeoSearchParams, ListingWithDistance, Listing,
  getGeohashBounds, distanceBetweenPoints
} from '@nerastay/shared';

function fromFirestoreDoc(data: Record<string, unknown>, id: string): Listing {
  const result: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(data)) {
    result[k] = v && typeof v === 'object' && 'toDate' in v ? (v as { toDate(): Date }).toDate() : v;
  }
  return result as unknown as Listing;
}

@Injectable({ providedIn: 'root' })
export class GeoQueryService {
  private firestore = inject(Firestore);

  queryByRadius(params: GeoSearchParams): Observable<ListingWithDistance[]> {
    const bounds = getGeohashBounds(params);

    const queries = bounds.map(({ lower, upper }) => {
      const q = query(
        collection(this.firestore, 'listings'),
        where('status', '==', 'approved'),
        orderBy('geohash'),
        startAt(lower),
        endAt(upper)
      );
      return from(getDocs(q)).pipe(
        map(snap =>
          snap.docs.map(d => fromFirestoreDoc(d.data() as Record<string, unknown>, d.id))
        )
      );
    });

    return combineLatest(queries).pipe(
      map(results => {
        const all = results.flat();
        const seen = new Set<string>();
        return all
          .filter(l => {
            if (seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          })
          .map(l => ({
            ...l,
            distanceKm: distanceBetweenPoints(params.center, l.coordinates)
          }))
          .filter(l => l.distanceKm <= params.radiusKm)
          .sort((a, b) => a.distanceKm - b.distanceKm);
      })
    );
  }
}
