import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';

@Component({
  selector: 'ns-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <img [src]="src()!" [alt]="alt()" class="avatar" [style.width.px]="size()" [style.height.px]="size()" />
    } @else {
      <div class="avatar avatar--fallback"
           [style.width.px]="size()"
           [style.height.px]="size()"
           [style.font-size.px]="size() * 0.4"
           [attr.aria-label]="alt()">
        {{ initial() }}
      </div>
    }
  `,
  styles: [`
    .avatar { border-radius: 50%; object-fit: cover; display: block; }
    .avatar--fallback { border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; text-transform: uppercase; }
  `]
})
export class AvatarComponent {
  src = input<string | null | undefined>(null);
  name = input('');
  alt = input('');
  size = input(40);

  readonly initial = computed(() => this.name()?.charAt(0)?.toUpperCase() ?? '?');
}
