import { Injectable, inject } from '@angular/core';
import { where, orderBy } from 'firebase/firestore';
import { Observable } from 'rxjs';
import {
  FirestoreService, StorageService,
  Listing, ListingFormData, ListingStatus,
  encodeGeohash
} from '@nerastay/shared';

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private firestoreService = inject(FirestoreService);
  private storageService = inject(StorageService);

  getById(id: string): Promise<Listing | null> {
    return this.firestoreService.getDoc<Listing>(`listings/${id}`);
  }

  listenById(id: string): Observable<Listing | null> {
    return this.firestoreService.listenDoc<Listing>(`listings/${id}`);
  }

  getByOwner(hostId: string): Promise<Listing[]> {
    return this.firestoreService.getCollection<Listing>(
      'listings',
      where('hostId', '==', hostId),
      orderBy('createdAt', 'desc')
    );
  }

  async createListing(data: ListingFormData, hostId: string): Promise<string> {
    const geohash = encodeGeohash(data.coordinates.lat, data.coordinates.lng);
    const now = this.firestoreService.serverTimestamp();
    const id = await this.firestoreService.addDoc('listings', {
      ...data,
      hostId,
      geohash,
      rating: 0,
      reviewCount: 0,
      status: 'pending' as ListingStatus,
      featured: false,
      photos: data.photos ?? [],
      createdAt: now,
      updatedAt: now
    });
    return id;
  }

  async updateListing(id: string, data: Partial<ListingFormData>): Promise<void> {
    const updates: Record<string, unknown> = { ...data, updatedAt: this.firestoreService.serverTimestamp() };
    if (data.coordinates) {
      updates['geohash'] = encodeGeohash(data.coordinates.lat, data.coordinates.lng);
    }
    return this.firestoreService.updateDoc(`listings/${id}`, updates);
  }

  async deleteListing(id: string): Promise<void> {
    return this.firestoreService.deleteDoc(`listings/${id}`);
  }

  async uploadPhotos(listingId: string, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const path = `listings/${listingId}/photos/${crypto.randomUUID()}_${file.name}`;
      await new Promise<void>((resolve, reject) => {
        this.storageService.uploadFile(path, file).subscribe({
          next: ({ downloadUrl }) => { if (downloadUrl) { urls.push(downloadUrl); resolve(); } },
          error: reject
        });
      });
    }
    return urls;
  }

  getPendingListings(): Promise<Listing[]> {
    return this.firestoreService.getCollection<Listing>(
      'listings',
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
  }

  async approveListing(id: string): Promise<void> {
    return this.firestoreService.updateDoc(`listings/${id}`, {
      status: 'approved' as ListingStatus,
      updatedAt: this.firestoreService.serverTimestamp()
    });
  }

  async rejectListing(id: string, reason?: string): Promise<void> {
    return this.firestoreService.updateDoc(`listings/${id}`, {
      status: 'rejected' as ListingStatus,
      rejectionReason: reason,
      updatedAt: this.firestoreService.serverTimestamp()
    });
  }
}
