import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ADMIN_ROUTES } from './admin-app.routes';
import { provideFirebase } from '@nerastay/shared';
import { environment } from '../environments/environment';

export const adminAppConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(ADMIN_ROUTES),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideFirebase(environment.firebase)
  ]
};
