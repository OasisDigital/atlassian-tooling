import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let AP: any;

@Injectable({
  providedIn: 'root',
})
export class ApService {
  getToken(): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        AP.context.getToken((token: string) => {
          resolve(token);
        });
      }),
    );
  }

  getTimeZone(): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        AP.user.getTimeZone((timeZone: string) => {
          resolve(timeZone);
        });
      }),
    );
  }
}
