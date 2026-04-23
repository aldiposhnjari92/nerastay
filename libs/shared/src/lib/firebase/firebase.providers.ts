import { InjectionToken, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { FirebaseConfig, FIREBASE_CONFIG } from './firebase.config';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const AUTH = new InjectionToken<Auth>('AUTH');
export const FIREBASE_STORAGE = new InjectionToken<FirebaseStorage>('FIREBASE_STORAGE');
export const FIREBASE_FUNCTIONS = new InjectionToken<Functions>('FIREBASE_FUNCTIONS');

let _app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) throw new Error('Firebase not initialized. Call provideFirebase() first.');
  return _app;
}

export function provideFirebase(config: FirebaseConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FIREBASE_CONFIG, useValue: config },
    {
      provide: FIREBASE_APP,
      useFactory: () => {
        if (!_app) _app = initializeApp(config);
        return _app;
      }
    },
    {
      provide: Firestore,
      useFactory: () => getFirestore(getFirebaseApp())
    },
    {
      provide: AUTH,
      useFactory: () => getAuth(getFirebaseApp())
    },
    {
      provide: FIREBASE_STORAGE,
      useFactory: () => getStorage(getFirebaseApp())
    },
    {
      provide: FIREBASE_FUNCTIONS,
      useFactory: () => getFunctions(getFirebaseApp())
    }
  ]);
}
