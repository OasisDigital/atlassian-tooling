import {
  AaitFeatureShellComponent,
  aaitFeatureShellRoutes,
} from '@aait/aait/feature-shell';
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
  ],
}).catch((err) => console.error(err));
