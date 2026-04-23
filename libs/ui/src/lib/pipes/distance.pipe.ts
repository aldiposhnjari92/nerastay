import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'distance' })
export class DistancePipe implements PipeTransform {
  transform(distanceKm: number, unit: 'km' | 'mi' = 'km'): string {
    if (unit === 'mi') {
      const miles = distanceKm * 0.621371;
      return miles < 0.1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
    }
    return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
  }
}
