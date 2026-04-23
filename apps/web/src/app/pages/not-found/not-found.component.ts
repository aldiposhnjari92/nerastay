import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ns-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="not-found" aria-labelledby="not-found-heading">
      <span class="not-found__icon" aria-hidden="true">🔍</span>
      <h1 id="not-found-heading" class="not-found__title">Page Not Found</h1>
      <p class="not-found__text">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/" class="btn btn--primary">Back to Home</a>
    </main>
  `,
  styles: [`
    .not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: calc(100vh - 64px); text-align: center; padding: 24px; }
    .not-found__icon { font-size: 4rem; }
    .not-found__title { font-size: 2rem; font-weight: 800; margin: 0; }
    .not-found__text { color: var(--text-muted); margin: 0; max-width: 360px; }
  `]
})
export class NotFoundComponent {}
