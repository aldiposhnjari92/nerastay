import { Injectable } from '@angular/core';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let loaderPromise: Promise<typeof google> | null = null;

@Injectable({ providedIn: 'root' })
export class MapLoaderService {
  private apiKey = '';

  configure(apiKey: string): void {
    this.apiKey = apiKey;
  }

  load(): Promise<typeof google> {
    if (loaderPromise) return loaderPromise;
    setOptions({
      key: this.apiKey,
      v: 'weekly',
      libraries: ['places', 'marker', 'geometry']
    });
    loaderPromise = importLibrary('maps').then(() => google);
    return loaderPromise;
  }
}
