import { Injectable, inject } from '@angular/core';
import {
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { FIREBASE_STORAGE } from './firebase.providers';

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject<FirebaseStorage>(FIREBASE_STORAGE);

  uploadFile(path: string, file: File): Observable<UploadProgress> {
    return new Observable(observer => {
      const storageRef = ref(this.storage, path);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next({ progress });
        },
        error => {
          observer.next({ progress: 0, error: error.message });
          observer.error(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          observer.next({ progress: 100, downloadUrl });
          observer.complete();
        }
      );

      return () => task.cancel();
    });
  }

  async deleteFile(path: string): Promise<void> {
    return deleteObject(ref(this.storage, path));
  }

  getRef(path: string) {
    return ref(this.storage, path);
  }
}
