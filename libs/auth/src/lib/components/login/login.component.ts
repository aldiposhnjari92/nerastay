import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'ns-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__logo" aria-hidden="true">📍</div>
        <h1 class="auth-card__title">Welcome to NearStay</h1>
        <p class="auth-card__subtitle">Sign in to discover places near you.</p>

        @if (store.error()) {
          <div class="alert alert--error" role="alert">{{ store.error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Sign in form">
          <div class="form-field">
            <label for="email" class="form-label">Email</label>
            <input id="email" type="email" class="input" formControlName="email"
                   autocomplete="email" aria-required="true"
                   [attr.aria-invalid]="invalid('email') ? 'true' : null" />
            @if (invalid('email')) {
              <span class="form-error" role="alert">Valid email is required.</span>
            }
          </div>

          <div class="form-field">
            <label for="password" class="form-label">Password</label>
            <input id="password" type="password" class="input" formControlName="password"
                   autocomplete="current-password" aria-required="true"
                   [attr.aria-invalid]="invalid('password') ? 'true' : null" />
            @if (invalid('password')) {
              <span class="form-error" role="alert">Password is required.</span>
            }
          </div>

          <button type="submit" class="btn btn--primary btn--full" [disabled]="store.loading()">
            {{ store.loading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-divider"><span>or</span></div>

        <button class="btn btn--google btn--full" (click)="googleSignIn()" [disabled]="store.loading()">
          <img src="https://www.google.com/favicon.ico" alt="" width="16" height="16" aria-hidden="true" />
          Continue with Google
        </button>

        <p class="auth-card__footer">
          Don't have an account? <a routerLink="/auth/register">Create one →</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: 'login.component.scss'
})
export class LoginComponent {
  readonly store = inject(AuthStore);
  private fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.value;
    this.store.signInWithEmail(email!, password!);
  }

  googleSignIn(): void {
    this.store.signInWithGoogle();
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
