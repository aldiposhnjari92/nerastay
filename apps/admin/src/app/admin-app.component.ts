import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './layout/sidebar/admin-sidebar.component';
import { ToastComponent } from '@nerastay/ui';

@Component({
  selector: 'ns-admin-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminSidebarComponent, ToastComponent],
  template: `
    <div class="admin-shell">
      <ns-admin-sidebar />
      <main class="admin-main" id="main-content">
        <router-outlet />
      </main>
    </div>
    <ns-toast-outlet />
  `,
  styles: [`
    .admin-shell { display: flex; min-height: 100vh; background: #f8fafc; }
    .admin-main { flex: 1; overflow-y: auto; }
  `]
})
export class AdminAppComponent {}
