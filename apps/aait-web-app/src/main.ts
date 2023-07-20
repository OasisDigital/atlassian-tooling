import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';

import {
  AaitFeatureShellComponent,
  aaitFeatureShellRoutes,
} from '@aait/aait/feature-shell';
import { provideAp } from '@aait/util-ap-injector';

bootstrapApplication(AaitFeatureShellComponent, {
  providers: [
    provideRouter(
      aaitFeatureShellRoutes,
      withEnabledBlockingInitialNavigation(),
    ),
    provideAp(),
  ],
}).catch((err) => console.error(err));