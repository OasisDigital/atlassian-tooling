import { bootstrapApplication } from '@angular/platform-browser';

import { provideAp } from '@oasisdigital/atlassian-connect-angular';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideAp()],
}).catch((err) => console.error(err));