import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../store/auth.store';
import { UserRole } from '@nerastay/shared';

@Component({
  selector: 'ns-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__logo" aria-hidden="true">📍</div>
        <h1 class="auth-card__title">Create Account</h1>
        <p class="auth-card__subtitle">Join NearStay as a traveller or business owner.</p>

        @if (store.error()) {
          <div class="alert alert--error" role="alert">{{ store.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Registration form">
          <div class="form-field">
            <label for="displayName" class="form-label">Full Name</label>
            <input id="displayName" type="text" class="input" formControlName="displayName"
                   autocomplete="name" aria-required="true" />
            @if (invalid('displayName')) {
              <span class="form-error" role="alert">Name is required.</span>
            }
          </div>

          <div class="form-field">
            <label for="reg-email" class="form-label">Email</label>
            <input id="reg-email" type="email" class="input" formControlName="email"
                   autocomplete="email" aria-required="true" />
            @if (invalid('email')) {
              <span class="form-error" role="alert">Valid email is required.</span>
            }
          </div>

          <div class="form-field">
            <label for="reg-password" class="form-label">Password</label>
            <input id="reg-password" type="password" class="input" formControlName="password"
                   autocomplete="new-password" aria-required="true" />
            @if (invalid('password')) {
              <span class="form-error" role="alert">Password must be at least 8 characters.</span>
            }
          </div>

          <fieldset class="role-selector">
            <legend class="form-label">I am a…</legend>
            <div class="role-options">
              <label class="role-option" [class.role-option--active]="form.value.role === 'guest'">
                <input type="radio" formControlName="role" value="guest" class="sr-only" />
                <span aria-hidden="true">🧳</span>
                <span>Traveller</span>
              </label>
              <label class="role-option" [class.role-option--active]="form.value.role === 'owner'">
                <input type="radio" formControlName="role" value="owner" class="sr-only" />
                <span aria-hidden="true">🏨</span>
                <span>Business Owner</span>
              </label>
            </div>
          </fieldset>

          <button type="submit" class="btn btn--primary btn--full" [disabled]="store.loading()">
            {{ store.loading() ? 'Creating account…' : 'Create Account' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Already have an account? <a routerLink="/auth/login">Sign in →</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: '../login/login.component.scss'
})
export class RegisterComponent {
  readonly store = inject(AuthStore);
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['guest' as UserRole]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password, displayName, role } = this.form.value;
    this.store.register(email!, password!, displayName!, role as UserRole);
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
