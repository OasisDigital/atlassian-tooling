import { ApplicationConfig } from '@angular/core';

import { provideAp } from '@oasisdigital/atlassian-connect-angular';

export const appConfig: ApplicationConfig = {
  providers: [provideAp()],
};
