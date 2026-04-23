export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface Booking {
  id: string;
  listingId: string;
  listingName: string;
  listingPhoto: string | null;
  hostId: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string | null;
}

export interface AvailabilityDoc {
  listingId: string;
  bookingId: string;
  blocked: boolean;
  checkIn: string;
  checkOut: string;
}
