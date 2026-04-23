import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '@nerastay/auth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/listings', label: 'Listings', icon: '🏨' },
  { path: '/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/users', label: 'Users', icon: '👥' }
];

@Component({
  selector: 'ns-admin-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" role="navigation" aria-label="Admin navigation">
      <div class="sidebar__brand">
        <span aria-hidden="true">🏨</span>
        <span>NearStay Admin</span>
      </div>

      <nav class="sidebar__nav">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="sidebar__link--active"
             class="sidebar__link"
             [attr.aria-label]="item.label">
            <span aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__user">
          <span class="sidebar__user-name">{{ authStore.displayName() }}</span>
          <span class="sidebar__user-role">Admin</span>
        </div>
        <button class="sidebar__signout" (click)="signOut()">Sign Out</button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar { width: 240px; min-height: 100vh; background: #1e293b; color: #f1f5f9; display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar__brand { display: flex; align-items: center; gap: 10px; padding: 24px 20px; font-size: 1rem; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar__nav { display: flex; flex-direction: column; gap: 4px; padding: 16px 12px; flex: 1; }
    .sidebar__link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; text-decoration: none; font-size: 0.9rem; font-weight: 500; color: #94a3b8; transition: all 0.15s; &:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; } &--active { background: rgba(59,130,246,0.2); color: #93c5fd; } &:focus-visible { outline: 2px solid #3b82f6; } }
    .sidebar__footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .sidebar__user { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; }
    .sidebar__user-name { font-size: 0.88rem; font-weight: 600; }
    .sidebar__user-role { font-size: 0.75rem; color: #64748b; }
    .sidebar__signout { width: 100%; padding: 8px; background: rgba(255,255,255,0.06); border: none; border-radius: 8px; color: #94a3b8; font-size: 0.82rem; cursor: pointer; &:hover { background: rgba(220,38,38,0.2); color: #fca5a5; } &:focus-visible { outline: 2px solid #3b82f6; } }
  `]
})
export class AdminSidebarComponent {
  readonly authStore = inject(AuthStore);
  readonly navItems = NAV_ITEMS;

  async signOut(): Promise<void> { await this.authStore.signOut(); }
}
