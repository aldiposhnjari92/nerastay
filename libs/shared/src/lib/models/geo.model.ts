export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoSearchParams {
  center: GeoPoint;
  radiusKm: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
