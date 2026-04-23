import { InjectionToken } from '@angular/core';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const FIREBASE_CONFIG = new InjectionToken<FirebaseConfig>('FIREBASE_CONFIG');
