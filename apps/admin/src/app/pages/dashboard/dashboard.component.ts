import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Firestore, collection, getCountFromServer, query, where } from '@angular/fire/firestore';
import { DecimalPipe } from '@angular/common';
import { SpinnerComponent } from '@nerastay/ui';

interface Stat { label: string; value: number | string; icon: string; color: string; }

@Component({
  selector: 'ns-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SpinnerComponent],
  template: `
    <div class="dashboard">
      <h1 class="dashboard__title">Dashboard</h1>

      @if (loading()) {
        <ns-spinner label="Loading stats…" />
      } @else {
        <div class="stat-grid">
          @for (stat of stats(); track stat.label) {
            <div class="stat-card" [style.--accent]="stat.color">
              <span class="stat-icon" aria-hidden="true">{{ stat.icon }}</span>
              <div class="stat-body">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          }
        </div>

        <div class="pending-section">
          <h2 class="section-title">Pending Approvals</h2>
          <p class="pending-hint">
            {{ pendingListings() }} listing{{ pendingListings() !== 1 ? 's' : '' }} awaiting review.
            <a href="/listings" class="link">Review now →</a>
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; }
    .dashboard__title { font-size: 1.6rem; font-weight: 800; margin: 0 0 28px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 36px; }
    .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 16px; border-left: 4px solid var(--accent); }
    .stat-icon { font-size: 1.8rem; }
    .stat-value { font-size: 1.6rem; font-weight: 800; display: block; }
    .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; }
    .section-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 12px; }
    .pending-hint { font-size: 0.9rem; color: #64748b; }
    .link { color: #3b82f6; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
  `]
})
export class DashboardComponent implements OnInit {
  private firestore = inject(Firestore);
  readonly loading = signal(true);
  readonly stats = signal<Stat[]>([]);
  readonly pendingListings = signal(0);

  async ngOnInit(): Promise<void> {
    try {
      const [users, listings, bookings, reviews, pending] = await Promise.all([
        getCountFromServer(collection(this.firestore, 'users')),
        getCountFromServer(collection(this.firestore, 'listings')),
        getCountFromServer(collection(this.firestore, 'bookings')),
        getCountFromServer(query(collection(this.firestore, 'listings'))),
        getCountFromServer(query(collection(this.firestore, 'listings'), where('status', '==', 'pending')))
      ]);
      this.stats.set([
        { label: 'Total Users', value: users.data().count, icon: '👥', color: '#3b82f6' },
        { label: 'Listings', value: listings.data().count, icon: '🏨', color: '#8b5cf6' },
        { label: 'Bookings', value: bookings.data().count, icon: '📅', color: '#10b981' },
        { label: 'Pending Review', value: pending.data().count, icon: '⏳', color: '#f59e0b' }
      ]);
      this.pendingListings.set(pending.data().count);
    } catch {
      this.stats.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
