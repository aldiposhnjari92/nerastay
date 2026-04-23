import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from 'firebase/functions';
import { Observable, from, map } from 'rxjs';
import { FIREBASE_FUNCTIONS } from '@nerastay/shared';

interface CheckoutSessionRequest {
  bookingId: string;
  listingName: string;
  total: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class StripeService {
  private functions = inject<Functions>(FIREBASE_FUNCTIONS);

  createCheckoutSession(req: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    const fn = httpsCallable<CheckoutSessionRequest, CheckoutSessionResponse>(
      this.functions,
      'createCheckoutSession'
    );
    return from(fn(req)).pipe(map(res => res.data));
  }

  redirectToCheckout(url: string): void {
    window.location.href = url;
  }
}
