export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'review_posted'
  | 'listing_approved'
  | 'listing_rejected';

export interface AppNotification {
  id: string;
  uid: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId?: string;
  iconUrl?: string;
  createdAt: Date;
}
