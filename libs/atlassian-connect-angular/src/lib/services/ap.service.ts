import { Inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { AP_INJECTOR } from '../ap-injector';
import { AP } from '../types';

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
      })
    );
  }

  getTimeZone(): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        this.ap.user.getTimeZone((timeZone: string) => {
          resolve(timeZone);
        });
      })
    );
  }
}
