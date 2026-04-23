import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { GeoPoint } from '../models/geo.model';

export type GeolocationError = 'permission_denied' | 'position_unavailable' | 'timeout' | 'unsupported';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentPosition(options?: PositionOptions): Observable<GeoPoint> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error({ type: 'unsupported' as GeolocationError, message: 'Geolocation is not supported by this browser.' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          observer.complete();
        },
        error => {
          const typeMap: Record<number, GeolocationError> = {
            1: 'permission_denied',
            2: 'position_unavailable',
            3: 'timeout'
          };
          observer.error({ type: typeMap[error.code] ?? 'position_unavailable', message: error.message });
        },
        options ?? { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
      );
    });
  }

  watchPosition(): Observable<GeoPoint> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error({ type: 'unsupported' });
        return;
      }
      const watchId = navigator.geolocation.watchPosition(
        pos => observer.next({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => observer.error(err)
      );
      return () => navigator.geolocation.clearWatch(watchId);
    });
  }
}
