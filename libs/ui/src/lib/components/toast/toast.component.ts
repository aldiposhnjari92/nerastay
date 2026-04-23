import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from './toast.service';

const ICONS: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

@Component({
  selector: 'ns-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="status" aria-live="polite" aria-atomic="false">
      @for (toast of service.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" role="alert">
          <span aria-hidden="true">{{ icons[toast.type] }}</span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close" (click)="service.dismiss(toast.id)" aria-label="Dismiss notification">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 360px; }
    .toast { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-size: 0.9rem; font-weight: 500; animation: slideIn 0.2s ease; }
    .toast--success { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
    .toast--error { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; }
    .toast--info { background: #eff6ff; border: 1px solid #93c5fd; color: #1d4ed8; }
    .toast--warning { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
    .toast__msg { flex: 1; }
    .toast__close { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0; color: inherit; opacity: 0.6; &:hover { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent {
  readonly service = inject(ToastService);
  readonly icons = ICONS;
}
