import { InjectionToken } from '@angular/core';
import { AP } from '@aait/util-atlassian-connect-api-types';

// Create an injector token for Angular
export const AP_INJECTOR = new InjectionToken<AP>('AP');
declare const AP: AP;

export function provideAp() {
  return { provide: AP_INJECTOR, useValue: AP };
}
