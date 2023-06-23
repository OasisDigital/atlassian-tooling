import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { bindCallback, map, Observable, switchMap } from 'rxjs';

import {
  AaitFeatureShellComponent,
  aaitFeatureShellRoutes,
} from '@aait/aait/feature-shell';

bootstrapApplication(AaitFeatureShellComponent, {
  providers: [
    provideRouter(
      aaitFeatureShellRoutes,
      withEnabledBlockingInitialNavigation(),
    ),
    provideHttpClient(withInterceptors([jiraAuthInterceptor])),
  ],
}).catch((err) => console.error(err));

// Should probably expand this type somehow
declare let AP: {
  context: {
    getToken: (cb: (token: string) => void) => void;
  };
};

// Todo: Test to see if this works, then move this somewhere else in the libs area
//       Possibly just a `jira` top level folder that has all the "util/data-access" projects
function jiraAuthInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return bindCallback(AP.context.getToken)().pipe(
    map((token) => {
      console.log('token', token);
      return req.clone({
        headers: req.headers.set('Authorization', `JWT ${token}`),
      });
    }),
    switchMap((clonedReq) => next(clonedReq)),
  );
}
