import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ns-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="home">
      <section class="hero" aria-labelledby="hero-heading">
        <div class="hero__content">
          <h1 id="hero-heading" class="hero__title">
            Find your perfect stay,<br />
            <span class="hero__accent">near you</span>
          </h1>
          <p class="hero__subtitle">
            Discover hotels, villas, and restaurants in your area — curated by locals, booked instantly.
          </p>
          <div class="hero__actions">
            <a routerLink="/listings" class="btn btn--primary btn--lg">Explore Now</a>
            <a routerLink="/listings/new" class="btn btn--outline btn--lg">List Your Property</a>
          </div>
        </div>
        <div class="hero__visual" aria-hidden="true">
          <div class="hero__card hero__card--1">🏨 Grand Hotel Centrale</div>
          <div class="hero__card hero__card--2">🏡 Villa Serena</div>
          <div class="hero__card hero__card--3">🍽️ Trattoria dei Sapori</div>
        </div>
      </section>

      <section class="categories" aria-labelledby="categories-heading">
        <div class="section-inner">
          <h2 id="categories-heading" class="section-title">Browse by Category</h2>
          <div class="category-grid">
            <a routerLink="/listings" [queryParams]="{type: 'hotel'}" class="category-card">
              <span class="category-icon" aria-hidden="true">🏨</span>
              <span class="category-name">Hotels</span>
              <span class="category-desc">Luxury stays &amp; boutique gems</span>
            </a>
            <a routerLink="/listings" [queryParams]="{type: 'villa'}" class="category-card">
              <span class="category-icon" aria-hidden="true">🏡</span>
              <span class="category-name">Villas</span>
              <span class="category-desc">Private escapes with a view</span>
            </a>
            <a routerLink="/listings" [queryParams]="{type: 'restaurant'}" class="category-card">
              <span class="category-icon" aria-hidden="true">🍽️</span>
              <span class="category-name">Restaurants</span>
              <span class="category-desc">Local flavors &amp; fine dining</span>
            </a>
          </div>
        </div>
      </section>

      <section class="cta-host" aria-labelledby="cta-heading">
        <div class="section-inner cta-host__inner">
          <div>
            <h2 id="cta-heading" class="cta-host__title">Own a property or restaurant?</h2>
            <p class="cta-host__text">Join thousands of hosts earning on NearStay. List for free, get booked today.</p>
          </div>
          <a routerLink="/auth/register" class="btn btn--primary btn--lg">Start Hosting</a>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .home { display: flex; flex-direction: column; }
    .hero { min-height: calc(100vh - 64px); display: flex; align-items: center; padding: 60px 24px; max-width: 1280px; margin: 0 auto; width: 100%; gap: 48px; }
    .hero__content { flex: 1; }
    .hero__title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.1; margin: 0 0 16px; }
    .hero__accent { color: var(--primary); }
    .hero__subtitle { font-size: 1.1rem; color: var(--text-muted); max-width: 480px; line-height: 1.7; margin: 0 0 32px; }
    .hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero__visual { flex: 1; display: flex; flex-direction: column; gap: 12px; max-width: 320px; }
    .hero__card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06); &--2 { transform: translateX(24px); } &--3 { transform: translateX(12px); } }
    .section-inner { max-width: 1280px; margin: 0 auto; padding: 64px 24px; }
    .section-title { font-size: 1.6rem; font-weight: 800; margin: 0 0 32px; }
    .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .category-card { display: flex; flex-direction: column; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; text-decoration: none; transition: all 0.2s; &:hover { border-color: var(--primary); box-shadow: 0 4px 16px rgba(59,130,246,0.12); transform: translateY(-2px); } &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; } }
    .category-icon { font-size: 2.4rem; }
    .category-name { font-size: 1.1rem; font-weight: 700; color: var(--text); }
    .category-desc { font-size: 0.85rem; color: var(--text-muted); }
    .cta-host { background: var(--primary); }
    .cta-host__inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
    .cta-host__title { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 0 8px; }
    .cta-host__text { color: rgba(255,255,255,0.8); margin: 0; }
    .btn--lg { padding: 14px 28px; font-size: 1rem; }
    @media (max-width: 768px) { .hero { flex-direction: column; min-height: unset; } .hero__visual { display: none; } }
  `]
})
export class HomeComponent {}
