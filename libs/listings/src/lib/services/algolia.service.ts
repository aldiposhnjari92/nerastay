import { Injectable } from '@angular/core';
import { algoliasearch } from 'algoliasearch';
import { Observable, from } from 'rxjs';
import { Listing } from '@nerastay/shared';

export interface AlgoliaFilters {
  city?: string;
  type?: string;
  minRating?: number;
  priceRange?: number;
  tags?: string[];
}

export interface AlgoliaGeoFilter {
  lat: number;
  lng: number;
  radiusMeters: number;
}

@Injectable({ providedIn: 'root' })
export class AlgoliaService {
  private client: ReturnType<typeof algoliasearch> | null = null;
  private indexName = '';

  configure(appId: string, searchKey: string, indexName: string): void {
    this.client = algoliasearch(appId, searchKey);
    this.indexName = indexName;
  }

  searchListings(
    queryText: string,
    filters: AlgoliaFilters = {},
    geo?: AlgoliaGeoFilter
  ): Observable<Listing[]> {
    if (!this.client) return from(Promise.resolve([]));

    const filterParts: string[] = [];
    if (filters.type) filterParts.push(`type:${filters.type}`);
    if (filters.city) filterParts.push(`city:${filters.city}`);
    if (filters.priceRange) filterParts.push(`priceRange<=${filters.priceRange}`);
    if (filters.minRating) filterParts.push(`rating>=${filters.minRating}`);
    if (filters.tags?.length) {
      filterParts.push(filters.tags.map(t => `tags:${t}`).join(' AND '));
    }

    const searchParams: Record<string, unknown> = {
      filters: filterParts.join(' AND '),
      hitsPerPage: 50
    };

    if (geo) {
      searchParams['aroundLatLng'] = `${geo.lat},${geo.lng}`;
      searchParams['aroundRadius'] = geo.radiusMeters;
    }

    return from(
      this.client!.search({
        requests: [{
          indexName: this.indexName,
          query: queryText,
          ...searchParams
        }]
      }).then(res => {
        const result = res.results[0] as { hits: unknown[] } | undefined;
        return (result?.hits ?? []) as Listing[];
      })
    );
  }
}
