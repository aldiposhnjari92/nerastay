import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ns-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="footer__logo" aria-hidden="true">🏨</span>
          <span class="footer__name">NearStay</span>
          <p class="footer__tagline">Discover unique places to stay near you.</p>
        </div>

        <nav class="footer__links" aria-label="Footer navigation">
          <div class="footer__col">
            <h3 class="footer__col-title">Explore</h3>
            <a routerLink="/listings" class="footer__link">All Listings</a>
            <a routerLink="/listings?type=hotel" class="footer__link">Hotels</a>
            <a routerLink="/listings?type=villa" class="footer__link">Villas</a>
            <a routerLink="/listings?type=restaurant" class="footer__link">Restaurants</a>
          </div>
          <div class="footer__col">
            <h3 class="footer__col-title">Hosts</h3>
            <a routerLink="/listings/new" class="footer__link">List Your Property</a>
            <a routerLink="/listings/my-listings" class="footer__link">My Listings</a>
            <a routerLink="/bookings/calendar" class="footer__link">Booking Calendar</a>
          </div>
          <div class="footer__col">
            <h3 class="footer__col-title">Account</h3>
            <a routerLink="/auth/login" class="footer__link">Sign In</a>
            <a routerLink="/auth/register" class="footer__link">Join NearStay</a>
            <a routerLink="/profile" class="footer__link">Profile</a>
          </div>
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; {{ year }} NearStay. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: var(--surface); border-top: 1px solid var(--border); margin-top: auto; }
    .footer__inner { max-width: 1280px; margin: 0 auto; padding: 48px 24px 32px; display: flex; gap: 48px; flex-wrap: wrap; }
    .footer__brand { flex: 1; min-width: 200px; }
    .footer__logo { font-size: 1.6rem; }
    .footer__name { font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-left: 6px; }
    .footer__tagline { color: var(--text-muted); font-size: 0.85rem; margin: 8px 0 0; }
    .footer__links { display: flex; gap: 32px; flex-wrap: wrap; }
    .footer__col { display: flex; flex-direction: column; gap: 8px; min-width: 120px; }
    .footer__col-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin: 0 0 4px; }
    .footer__link { text-decoration: none; font-size: 0.88rem; color: var(--text-secondary); &:hover { color: var(--primary); } &:focus-visible { outline: 2px solid var(--primary); border-radius: 2px; } }
    .footer__bottom { border-top: 1px solid var(--border); padding: 16px 24px; text-align: center; }
    .footer__copy { color: var(--text-muted); font-size: 0.82rem; margin: 0; }
  `]
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
