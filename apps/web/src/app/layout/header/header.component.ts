import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarComponent } from '@nerastay/ui';
import { AuthStore } from '@nerastay/auth';

@Component({
  selector: 'ns-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AvatarComponent],
  template: `
    <header class="header" role="banner">
      <div class="header__inner">
        <a routerLink="/" class="header__logo" aria-label="NearStay home">
          <span class="logo-icon" aria-hidden="true">🏨</span>
          <span class="logo-text">NearStay</span>
        </a>

        <nav class="header__nav" aria-label="Main navigation">
          <a routerLink="/listings" routerLinkActive="nav-link--active" class="nav-link">Explore</a>
          @if (authStore.isOwner()) {
            <a routerLink="/listings/my-listings" routerLinkActive="nav-link--active" class="nav-link">My Listings</a>
            <a routerLink="/bookings/calendar" routerLinkActive="nav-link--active" class="nav-link">Calendar</a>
          }
          @if (authStore.isLoggedIn()) {
            <a routerLink="/bookings" routerLinkActive="nav-link--active" class="nav-link">Trips</a>
          }
        </nav>

        <div class="header__actions">
          @if (authStore.isOwner()) {
            <a routerLink="/listings/new" class="btn btn--primary btn--sm">+ List Property</a>
          }
          @if (authStore.isLoggedIn()) {
            <div class="user-menu">
              <button class="user-menu__trigger" (click)="menuOpen.set(!menuOpen())"
                      [attr.aria-expanded]="menuOpen()" aria-haspopup="true"
                      aria-label="User menu">
                <ns-avatar
                  [name]="authStore.displayName() ?? 'User'"
                  [photoUrl]="authStore.photoURL() ?? undefined"
                  size="sm" />
              </button>
              @if (menuOpen()) {
                <div class="user-menu__dropdown" role="menu">
                  <a routerLink="/profile" class="menu-item" role="menuitem" (click)="menuOpen.set(false)">Profile</a>
                  <a routerLink="/bookings" class="menu-item" role="menuitem" (click)="menuOpen.set(false)">My Bookings</a>
                  @if (authStore.isAdmin()) {
                    <a routerLink="/admin" class="menu-item" role="menuitem" (click)="menuOpen.set(false)">Admin Panel</a>
                  }
                  <hr class="menu-divider" />
                  <button class="menu-item menu-item--danger" role="menuitem" (click)="signOut()">Sign Out</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn--ghost btn--sm">Sign In</a>
            <a routerLink="/auth/register" class="btn btn--primary btn--sm">Join Free</a>
          }
        </div>

        <button class="burger" [class.burger--open]="mobileOpen()"
                (click)="mobileOpen.set(!mobileOpen())"
                [attr.aria-expanded]="mobileOpen()"
                aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (mobileOpen()) {
        <nav class="mobile-nav" aria-label="Mobile navigation">
          <a routerLink="/listings" class="mobile-nav__link" (click)="mobileOpen.set(false)">Explore</a>
          @if (authStore.isLoggedIn()) {
            <a routerLink="/bookings" class="mobile-nav__link" (click)="mobileOpen.set(false)">My Trips</a>
          }
          @if (authStore.isOwner()) {
            <a routerLink="/listings/my-listings" class="mobile-nav__link" (click)="mobileOpen.set(false)">My Listings</a>
            <a routerLink="/listings/new" class="mobile-nav__link" (click)="mobileOpen.set(false)">+ New Listing</a>
          }
          @if (!authStore.isLoggedIn()) {
            <a routerLink="/auth/login" class="mobile-nav__link" (click)="mobileOpen.set(false)">Sign In</a>
            <a routerLink="/auth/register" class="mobile-nav__link" (click)="mobileOpen.set(false)">Join Free</a>
          } @else {
            <button class="mobile-nav__link mobile-nav__link--danger" (click)="signOut()">Sign Out</button>
          }
        </nav>
      }
    </header>
  `,
  styles: [`
    .header { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    .header__inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 24px; }
    .header__logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
    .logo-icon { font-size: 1.4rem; }
    .logo-text { font-size: 1.2rem; font-weight: 800; color: var(--primary); }
    .header__nav { display: flex; gap: 4px; flex: 1; }
    .nav-link { padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); transition: all 0.15s; &:hover { background: var(--bg); color: var(--text); } &--active { color: var(--primary); background: rgba(59,130,246,0.08); } &:focus-visible { outline: 2px solid var(--primary); } }
    .header__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .user-menu { position: relative; }
    .user-menu__trigger { background: none; border: none; cursor: pointer; padding: 0; border-radius: 50%; &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; } }
    .user-menu__dropdown { position: absolute; right: 0; top: calc(100% + 8px); background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 200; }
    .menu-item { display: block; width: 100%; text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; text-decoration: none; color: var(--text); background: none; border: none; cursor: pointer; &:hover { background: var(--bg); } &--danger { color: var(--error, #dc2626); } &:focus-visible { outline: 2px solid var(--primary); } }
    .menu-divider { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
    .burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; margin-left: auto; span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.2s; } &--open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); } &--open span:nth-child(2) { opacity: 0; } &--open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); } &:focus-visible { outline: 2px solid var(--primary); } }
    .mobile-nav { display: none; flex-direction: column; border-top: 1px solid var(--border); padding: 12px 24px 16px; gap: 4px; }
    .mobile-nav__link { padding: 10px 12px; border-radius: 8px; text-decoration: none; font-size: 0.95rem; font-weight: 500; color: var(--text-secondary); border: none; background: none; cursor: pointer; text-align: left; &:hover { background: var(--bg); color: var(--text); } &--danger { color: var(--error, #dc2626); } }
    @media (max-width: 768px) {
      .header__nav, .header__actions { display: none; }
      .burger { display: flex; }
      .mobile-nav { display: flex; }
    }
  `]
})
export class HeaderComponent {
  readonly authStore = inject(AuthStore);
  readonly menuOpen = signal(false);
  readonly mobileOpen = signal(false);

  async signOut(): Promise<void> {
    this.menuOpen.set(false);
    this.mobileOpen.set(false);
    await this.authStore.signOut();
  }
}
