import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ToastComponent } from '@nerastay/ui';
import { AuthStore } from '@nerastay/auth';
import { FcmService } from '@nerastay/auth';

@Component({
  selector: 'ns-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <ns-header />
    <router-outlet />
    <ns-footer />
    <ns-toast-outlet />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    router-outlet + * { flex: 1; }
  `]
})
export class AppComponent implements OnInit {
  private authStore = inject(AuthStore);
  private fcmService = inject(FcmService);

  ngOnInit(): void {
    if (this.authStore.isLoggedIn()) {
      this.fcmService.requestPermission().catch(() => {});
    }
  }
}
