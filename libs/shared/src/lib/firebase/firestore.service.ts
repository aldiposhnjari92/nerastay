import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  addDoc,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  CollectionReference,
  DocumentReference,
  Timestamp,
  QuerySnapshot,
  DocumentSnapshot,
  WriteBatch,
  writeBatch,
  serverTimestamp,
  FieldValue,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

function fromFirestore<T>(data: DocumentData | undefined): T {
  if (!data) return {} as T;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    result[key] = val instanceof Timestamp ? val.toDate() : val;
  }
  return result as T;
}

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private firestore = inject(Firestore);

  docRef<T>(path: string): DocumentReference<DocumentData> {
    return doc(this.firestore, path);
  }

  collectionRef<T>(path: string): CollectionReference<DocumentData> {
    return collection(this.firestore, path);
  }

  async getDoc<T>(path: string): Promise<T | null> {
    const snap = await getDoc(doc(this.firestore, path));
    if (!snap.exists()) return null;
    return { ...fromFirestore<T>(snap.data()), id: snap.id } as T;
  }

  async setDoc<T extends object>(path: string, data: T, merge = false): Promise<void> {
    return setDoc(doc(this.firestore, path), data, { merge });
  }

  async addDoc<T extends object>(collectionPath: string, data: T): Promise<string> {
    const ref = await addDoc(collection(this.firestore, collectionPath), data);
    return ref.id;
  }

  async updateDoc(path: string, data: Partial<Record<string, unknown>>): Promise<void> {
    return updateDoc(doc(this.firestore, path), data);
  }

  async deleteDoc(path: string): Promise<void> {
    return deleteDoc(doc(this.firestore, path));
  }

  async getCollection<T>(
    collectionPath: string,
    ...constraints: QueryConstraint[]
  ): Promise<T[]> {
    const q = query(collection(this.firestore, collectionPath), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...fromFirestore<T>(d.data()), id: d.id }) as T);
  }

  listenDoc<T>(path: string): Observable<T | null> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(
        doc(this.firestore, path),
        (snap: DocumentSnapshot) => {
          if (!snap.exists()) {
            observer.next(null);
          } else {
            observer.next({ ...fromFirestore<T>(snap.data()), id: snap.id } as T);
          }
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  listenCollection<T>(
    collectionPath: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    return new Observable(observer => {
      const q = query(collection(this.firestore, collectionPath), ...constraints);
      const unsubscribe = onSnapshot(
        q,
        (snap: QuerySnapshot) => {
          const docs = snap.docs.map(d => ({ ...fromFirestore<T>(d.data()), id: d.id }) as T);
          observer.next(docs);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  batch(): WriteBatch {
    return writeBatch(this.firestore);
  }

  serverTimestamp(): FieldValue {
    return serverTimestamp();
  }

  increment(n: number): FieldValue {
    return increment(n);
  }

  arrayUnion(...items: unknown[]): FieldValue {
    return arrayUnion(...items);
  }

  arrayRemove(...items: unknown[]): FieldValue {
    return arrayRemove(...items);
  }
}
