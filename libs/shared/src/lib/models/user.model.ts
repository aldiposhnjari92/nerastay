export type UserRole = 'guest' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  fcmToken?: string;
  favoriteListingIds: string[];
  createdAt: Date;
}
