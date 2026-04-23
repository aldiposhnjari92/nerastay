import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Booking, BookingFormData } from '@nerastay/shared';
import { BookingService } from '../services/booking.service';
import { StripeService } from '../services/stripe.service';
import { AvailabilityService } from '../services/availability.service';
import { AuthStore } from '@nerastay/auth';

interface BookingState {
  guestBookings: Booking[];
  hostBookings: Booking[];
  currentBooking: Booking | null;
  blockedDates: Date[];
  loading: boolean;
  checkoutLoading: boolean;
  availabilityLoading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  guestBookings: [],
  hostBookings: [],
  currentBooking: null,
  blockedDates: [],
  loading: false,
  checkoutLoading: false,
  availabilityLoading: false,
  error: null
};

export const BookingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    upcomingTrips: computed(() =>
      store.guestBookings()
        .filter(b => new Date(b.checkIn) >= new Date() && b.status !== 'cancelled')
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    ),
    pastTrips: computed(() =>
      store.guestBookings()
        .filter(b => new Date(b.checkOut) < new Date())
        .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())
    ),
    pendingReservations: computed(() =>
      store.hostBookings().filter(b => b.status === 'pending')
    ),
    confirmedReservations: computed(() =>
      store.hostBookings().filter(b => b.status === 'confirmed')
    )
  })),
  withMethods(store => {
    const bookingService = inject(BookingService);
    const stripeService = inject(StripeService);
    const availabilityService = inject(AvailabilityService);
    const authStore = inject(AuthStore);

    return {
      async loadGuestBookings(): Promise<void> {
        const uid = authStore.uid();
        if (!uid) return;
        patchState(store, { loading: true, error: null });
        try {
          const bookings = await firstValueFrom(bookingService.getGuestBookings(uid));
          patchState(store, { guestBookings: bookings, loading: false });
        } catch (e: unknown) {
          patchState(store, { error: String(e), loading: false });
        }
      },

      async loadHostBookings(): Promise<void> {
        const uid = authStore.uid();
        if (!uid) return;
        patchState(store, { loading: true, error: null });
        try {
          const bookings = await firstValueFrom(bookingService.getHostBookings(uid));
          patchState(store, { hostBookings: bookings, loading: false });
        } catch (e: unknown) {
          patchState(store, { error: String(e), loading: false });
        }
      },

      async loadBooking(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const booking = await firstValueFrom(bookingService.getBooking(id));
          patchState(store, { currentBooking: booking, loading: false });
        } catch (e: unknown) {
          patchState(store, { error: String(e), loading: false });
        }
      },

      async loadBlockedDates(listingId: string): Promise<void> {
        patchState(store, { availabilityLoading: true });
        try {
          const dates = await firstValueFrom(availabilityService.getBlockedDates(listingId));
          patchState(store, { blockedDates: dates, availabilityLoading: false });
        } catch {
          patchState(store, { availabilityLoading: false });
        }
      },

      async initiateBooking(
        formData: BookingFormData,
        listing: { id: string; name: string; photos: string[]; pricePerNight: number; currency: string; hostId: string }
      ): Promise<void> {
        const user = authStore.user();
        if (!user) { patchState(store, { error: 'You must be logged in to book.' }); return; }

        patchState(store, { checkoutLoading: true, error: null });
        try {
          const available = await firstValueFrom(
            availabilityService.isAvailable(listing.id, formData.checkIn, formData.checkOut)
          );
          if (!available) {
            patchState(store, { error: 'Selected dates are no longer available.', checkoutLoading: false });
            return;
          }

          const bookingId = await bookingService.createBooking({
            ...formData,
            listingName: listing.name,
            listingPhoto: listing.photos[0] ?? null,
            hostId: listing.hostId,
            guestId: user.uid,
            guestName: user.displayName,
            guestEmail: user.email,
            pricePerNight: listing.pricePerNight,
            currency: listing.currency
          });

          const booking = await firstValueFrom(bookingService.getBooking(bookingId));
          if (!booking) throw new Error('Booking not found after creation');

          const session = await firstValueFrom(stripeService.createCheckoutSession({
            bookingId,
            listingName: listing.name,
            total: booking.total,
            currency: listing.currency,
            successUrl: `${window.location.origin}/bookings/${bookingId}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/listings/${listing.id}`
          }));

          stripeService.redirectToCheckout(session.url);
        } catch (e: unknown) {
          patchState(store, { error: String(e), checkoutLoading: false });
        }
      },

      async cancelBooking(bookingId: string): Promise<void> {
        patchState(store, { loading: true });
        try {
          await bookingService.updateStatus(bookingId, 'cancelled');
          const update = (b: Booking) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b;
          patchState(store, {
            guestBookings: store.guestBookings().map(update),
            hostBookings: store.hostBookings().map(update),
            loading: false
          });
        } catch (e: unknown) {
          patchState(store, { error: String(e), loading: false });
        }
      },

      clearError(): void { patchState(store, { error: null }); }
    };
  })
);
