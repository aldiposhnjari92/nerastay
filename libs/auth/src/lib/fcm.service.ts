import { Injectable, inject } from '@angular/core';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { Observable } from 'rxjs';
import { getFirebaseApp } from '@nerastay/shared';
import { UserProfileService } from './user-profile.service';
import { AuthStore } from './store/auth.store';

const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // Replace with actual VAPID key

@Injectable({ providedIn: 'root' })
export class FcmService {
  private profileService = inject(UserProfileService);
  private authStore = inject(AuthStore);

  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const messaging = getMessaging(getFirebaseApp());
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      const uid = this.authStore.uid();
      if (uid && token) {
        await this.profileService.updateFcmToken(uid, token);
      }

      return token;
    } catch (err) {
      console.warn('FCM permission denied or unsupported:', err);
      return null;
    }
  }

  onForegroundMessage(): Observable<MessagePayload> {
    return new Observable(observer => {
      const messaging = getMessaging(getFirebaseApp());
      const unsubscribe = onMessage(messaging, payload => observer.next(payload));
      return () => unsubscribe();
    });
  }
}
