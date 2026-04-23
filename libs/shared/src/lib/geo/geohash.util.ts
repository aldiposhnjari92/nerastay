import { geohashForLocation, geohashQueryBounds, distanceBetween as geoDistance } from 'geofire-common';
import { GeoPoint, GeoSearchParams } from '../models/geo.model';

export function encodeGeohash(lat: number, lng: number, precision = 9): string {
  return geohashForLocation([lat, lng], precision);
}

export interface GeohashBound {
  lower: string;
  upper: string;
}

export function getGeohashBounds(params: GeoSearchParams): GeohashBound[] {
  const bounds = geohashQueryBounds([params.center.lat, params.center.lng], params.radiusKm * 1000);
  return bounds.map(([lower, upper]) => ({ lower, upper }));
}

export function distanceBetweenPoints(a: GeoPoint, b: GeoPoint): number {
  return geoDistance([a.lat, a.lng], [b.lat, b.lng]);
}
