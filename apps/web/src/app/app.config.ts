import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_ROUTES } from './app.routes';
import { provideFirebase } from '@nerastay/shared';
import { environment } from '../environments/environment';
import { AlgoliaService } from '@nerastay/listings';
import { APP_INITIALIZER } from '@angular/core';

function initAlgolia(algolia: AlgoliaService) {
  return () => algolia.configure(
    environment.algolia.appId,
    environment.algolia.searchKey,
    environment.algolia.indexName
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideFirebase(environment.firebase),
    {
      provide: APP_INITIALIZER,
      useFactory: initAlgolia,
      deps: [AlgoliaService],
      multi: true
    }
  ]
};
