import { Component, input, output, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef } from '@angular/core';

@Component({
  selector: 'ns-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay"
         (click)="onOverlayClick($event)"
         role="dialog"
         [attr.aria-labelledby]="titleId()"
         aria-modal="true">
      <div class="modal-panel" #panel>
        <div class="modal-header">
          <h2 [id]="titleId()" class="modal-title">{{ title() }}</h2>
          <button class="modal-close" (click)="closed.emit()" aria-label="Close dialog">×</button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; backdrop-filter: blur(4px); }
    .modal-panel { background: var(--surface); border-radius: 20px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; }
    .modal-title { font-size: 1.2rem; font-weight: 700; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); padding: 0; line-height: 1; &:hover { color: var(--text-primary); } &:focus-visible { outline: 2px solid var(--primary); border-radius: 4px; } }
    .modal-body { padding: 20px 28px 28px; }
  `]
})
export class ModalComponent {
  title = input('');
  titleId = input('modal-title');
  closed = output();

  onOverlayClick(e: Event): void {
    if (e.target === e.currentTarget) this.closed.emit();
  }
}
