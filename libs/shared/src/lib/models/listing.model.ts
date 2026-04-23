export type ListingType = 'hotel' | 'restaurant' | 'villa';
export type ListingStatus = 'pending' | 'approved' | 'rejected';

export interface ListingCoordinates {
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  hostId: string;
  type: ListingType;
  name: string;
  description: string;
  photos: string[];
  address: string;
  city: string;
  country: string;
  coordinates: ListingCoordinates;
  geohash: string;
  tags: string[];
  priceRange: 1 | 2 | 3 | 4;
  pricePerNight: number;
  currency: string;
  maxGuests?: number;
  rating: number;
  reviewCount: number;
  status: ListingStatus;
  featured: boolean;
  stripeProductId?: string;
  algoliaObjectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingWithDistance extends Listing {
  distanceKm: number;
}

export type ListingFormData = Pick<
  Listing,
  'type' | 'name' | 'description' | 'address' | 'city' | 'country' | 'coordinates' | 'tags' | 'priceRange' | 'pricePerNight' | 'currency'
> & {
  photos?: string[];
  maxGuests?: number;
};

export interface ListingFilters {
  type?: ListingType;
  priceRange?: 1 | 2 | 3 | 4;
  minRating?: number;
  tags?: string[];
  query?: string;
}
