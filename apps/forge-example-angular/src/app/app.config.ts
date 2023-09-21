import { ApplicationConfig, Component } from '@angular/core';
import { provideRouter } from '@angular/router';

@Component({
  template: '<h1>Dashboard!</h1>',
})
class DashboardComponent {}

@Component({
  template: '<h1>Other!</h1>',
})
class OtherComponent {}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'other',
        component: OtherComponent,
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ]),
  ],
};
