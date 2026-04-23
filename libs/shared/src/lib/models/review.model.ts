export interface Review {
  id: string;
  listingId: string;
  bookingId: string | null;
  authorId: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  comment: string;
  photos: string[];
  ownerReply: string | null;
  ownerRepliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewFormData {
  listingId: string;
  bookingId?: string;
  rating: number;
  comment: string;
  photos?: File[];
}
