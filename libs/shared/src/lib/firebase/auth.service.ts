import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  getIdToken
} from 'firebase/auth';
import { Observable } from 'rxjs';
import { AUTH } from './firebase.providers';

export type { FirebaseUser };

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private auth = inject<Auth>(AUTH);

  readonly currentUser$: Observable<FirebaseUser | null> = new Observable(observer => {
    const unsubscribe = onAuthStateChanged(
      this.auth,
      user => observer.next(user),
      error => observer.error(error)
    );
    return () => unsubscribe();
  });

  async signInWithEmailPassword(email: string, password: string): Promise<FirebaseUser> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async createUserWithEmailPassword(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(user, { displayName });
    return user;
  }

  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(this.auth, provider);
    return user;
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  async sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  async getIdToken(forceRefresh = false): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return getIdToken(user, forceRefresh);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
