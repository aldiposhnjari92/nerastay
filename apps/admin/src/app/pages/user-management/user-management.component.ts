import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, query, orderBy, limit } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { SpinnerComponent, AvatarComponent } from '@nerastay/ui';
import { UserProfile } from '@nerastay/shared';

@Component({
  selector: 'ns-user-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, SpinnerComponent, AvatarComponent],
  template: `
    <div class="users">
      <h1 class="users__title">User Management</h1>

      @if (loading()) {
        <ns-spinner label="Loading users…" />
      } @else {
        <div class="user-table">
          <div class="table-head">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>
          @for (user of users(); track user.uid) {
            <div class="table-row">
              <div class="user-cell">
                <ns-avatar [name]="user.displayName" [photoUrl]="user.photoURL ?? undefined" size="sm" />
                <span class="user-name">{{ user.displayName }}</span>
              </div>
              <span class="cell">{{ user.email }}</span>
              <span class="cell">
                <span class="role-badge role-badge--{{ user.role }}">{{ user.role }}</span>
              </span>
              <span class="cell">{{ user.createdAt | date:'mediumDate' }}</span>
              <div class="cell cell--actions">
                @if (user.role !== 'admin') {
                  <button class="action-btn" [disabled]="processingId() === user.uid"
                          (click)="setRole(user.uid, 'admin')">Make Admin</button>
                }
                @if (user.role === 'guest') {
                  <button class="action-btn" [disabled]="processingId() === user.uid"
                          (click)="setRole(user.uid, 'owner')">Make Owner</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .users { padding: 32px; }
    .users__title { font-size: 1.6rem; font-weight: 800; margin: 0 0 24px; }
    .user-table { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
    .table-head { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr; padding: 12px 20px; background: #f8fafc; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; }
    .table-row { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr; padding: 12px 20px; border-top: 1px solid #e2e8f0; align-items: center; gap: 8px; &:hover { background: #f8fafc; } }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-name { font-weight: 600; font-size: 0.88rem; }
    .cell { font-size: 0.85rem; color: #334155; &--actions { display: flex; gap: 6px; flex-wrap: wrap; } }
    .role-badge { padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
    .role-badge--guest { background: #f1f5f9; color: #475569; }
    .role-badge--owner { background: #eff6ff; color: #1d4ed8; }
    .role-badge--admin { background: #fdf4ff; color: #7e22ce; }
    .action-btn { padding: 4px 12px; border-radius: 6px; border: 1.5px solid #3b82f6; color: #3b82f6; background: transparent; font-size: 0.78rem; font-weight: 600; cursor: pointer; &:hover { background: #eff6ff; } &:disabled { opacity: 0.4; cursor: not-allowed; } &:focus-visible { outline: 2px solid #3b82f6; } }
  `]
})
export class UserManagementComponent implements OnInit {
  private firestore = inject(Firestore);
  readonly loading = signal(true);
  readonly users = signal<UserProfile[]>([]);
  readonly processingId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      this.users.set(snap.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          email: data['email'] as string,
          displayName: data['displayName'] as string,
          photoURL: data['photoURL'] as string | null,
          role: data['role'] as UserProfile['role'],
          favoriteListings: (data['favoriteListings'] as string[]) ?? [],
          fcmToken: data['fcmToken'] as string | undefined,
          createdAt: (data['createdAt'] as { toDate(): Date })?.toDate() ?? new Date(),
          updatedAt: (data['updatedAt'] as { toDate(): Date })?.toDate() ?? new Date()
        };
      }));
    } finally {
      this.loading.set(false);
    }
  }

  async setRole(uid: string, role: 'admin' | 'owner'): Promise<void> {
    this.processingId.set(uid);
    await updateDoc(doc(this.firestore, `users/${uid}`), { role });
    this.users.update(us => us.map(u => u.uid === uid ? { ...u, role } : u));
    this.processingId.set(null);
  }
}
