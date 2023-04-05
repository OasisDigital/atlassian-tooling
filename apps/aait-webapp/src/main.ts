import {
  AaitFeatureShellComponent,
  aaitFeatureShellRoutes,
} from '@aait/aait/feature-shell';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';

bootstrapApplication(AaitFeatureShellComponent, {
  providers: [
    provideRouter(
      aaitFeatureShellRoutes,
      withEnabledBlockingInitialNavigation(),
    ),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
