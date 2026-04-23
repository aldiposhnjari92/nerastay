import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ns-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'spinner' + (overlay() ? ' spinner--overlay' : '')"
         role="status"
         [attr.aria-label]="label()">
      <div class="spinner__ring" aria-hidden="true"></div>
      @if (label()) {
        <span class="spinner__label">{{ label() }}</span>
      }
    </div>
  `,
  styles: [`
    .spinner { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; }
    .spinner--overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.8); z-index: 999; }
    .spinner__ring { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
    .spinner__label { font-size: 0.9rem; color: var(--text-muted); }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SpinnerComponent {
  overlay = input(false);
  label = input('Loading…');
}
