import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { AuthStore } from '../../store/auth.store';
import { UserProfileService } from '../../user-profile.service';
import { StorageService } from '@nerastay/shared';

@Component({
  selector: 'ns-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TitleCasePipe],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <h1 class="profile-card__title">Your Profile</h1>

        <div class="profile-avatar">
          @if (store.photoURL()) {
            <img [src]="store.photoURL()!" [alt]="store.displayName() + ' avatar'" class="profile-avatar__img" />
          } @else {
            <div class="profile-avatar__fallback" aria-hidden="true">
              {{ store.displayName().charAt(0).toUpperCase() }}
            </div>
          }
          <label class="profile-avatar__upload" aria-label="Upload profile photo">
            <input type="file" accept="image/*" (change)="onPhotoSelected($event)" class="sr-only" />
            <span>📷</span>
          </label>
        </div>

        @if (uploadProgress() !== null) {
          <div class="progress" role="progressbar" [attr.aria-valuenow]="uploadProgress()" aria-valuemin="0" aria-valuemax="100">
            <div class="progress__bar" [style.width]="uploadProgress() + '%'"></div>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="save()" aria-label="Edit profile form">
          <div class="form-field">
            <label for="displayName" class="form-label">Display Name</label>
            <input id="displayName" type="text" class="input" formControlName="displayName" />
          </div>

          <div class="form-field">
            <label class="form-label">Role</label>
            <div class="role-badge">{{ store.user()?.role | titlecase }}</div>
          </div>

          <button type="submit" class="btn btn--primary" [disabled]="saving()">
            {{ saving() ? 'Saving…' : 'Save Changes' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { max-width: 480px; margin: 60px auto; padding: 0 24px; }
    .profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; display: flex; flex-direction: column; gap: 24px; }
    .profile-card__title { font-size: 1.4rem; font-weight: 800; margin: 0; }
    .profile-avatar { position: relative; width: 88px; height: 88px; margin: 0 auto; }
    .profile-avatar__img, .profile-avatar__fallback { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; }
    .profile-avatar__fallback { background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; }
    .profile-avatar__upload { position: absolute; bottom: 0; right: 0; background: var(--primary); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; }
    .progress { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
    .progress__bar { height: 100%; background: var(--primary); transition: width 0.2s; }
    .role-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
  `]
})
export class ProfileComponent {
  readonly store = inject(AuthStore);
  private fb = inject(FormBuilder);
  private profileService = inject(UserProfileService);
  private storageService = inject(StorageService);

  readonly saving = signal(false);
  readonly uploadProgress = signal<number | null>(null);

  readonly form = this.fb.group({
    displayName: [this.store.displayName(), Validators.required]
  });

  async save(): Promise<void> {
    if (this.form.invalid) return;
    const uid = this.store.uid();
    if (!uid) return;
    this.saving.set(true);
    await this.profileService.updateProfile(uid, { displayName: this.form.value.displayName! });
    this.saving.set(false);
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const uid = this.store.uid();
    if (!file || !uid) return;
    this.uploadProgress.set(0);
    this.storageService.uploadFile(`users/${uid}/avatar/${file.name}`, file).subscribe({
      next: ({ progress, downloadUrl }) => {
        this.uploadProgress.set(progress);
        if (downloadUrl) {
          this.profileService.updateProfile(uid, { photoURL: downloadUrl });
          this.uploadProgress.set(null);
        }
      }
    });
  }
}
