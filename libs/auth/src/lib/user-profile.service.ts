import { Injectable, inject } from '@angular/core';
import { FirestoreService, UserProfile } from '@nerastay/shared';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private firestoreService = inject(FirestoreService);

  async getProfile(uid: string): Promise<UserProfile | null> {
    return this.firestoreService.getDoc<UserProfile>(`users/${uid}`);
  }

  async createProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profile: UserProfile = {
      uid,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      photoURL: data.photoURL,
      role: data.role ?? 'guest',
      favoriteListingIds: data.favoriteListingIds ?? [],
      createdAt: new Date(),
      ...data
    };
    await this.firestoreService.setDoc(`users/${uid}`, profile);
    return profile;
  }

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    return this.firestoreService.updateDoc(`users/${uid}`, data as Record<string, unknown>);
  }

  async updateFcmToken(uid: string, token: string): Promise<void> {
    return this.firestoreService.updateDoc(`users/${uid}`, { fcmToken: token });
  }
}
