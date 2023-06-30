import { AP_INJECTOR } from '@aait/util-ap-injector';
import { AP } from '@aait/util-atlassian-connect-api-types';
import { Inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApService {
  constructor(@Inject(AP_INJECTOR) private ap: AP) {}
  getToken(): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        this.ap.context.getToken((token: string) => {
          resolve(token);
        });
      }),
    );
  }

  getTimeZone(): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        this.ap.user.getTimeZone((timeZone: string) => {
          resolve(timeZone);
        });
      }),
    );
  }
}
