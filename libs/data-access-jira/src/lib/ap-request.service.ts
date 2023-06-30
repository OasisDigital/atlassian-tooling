import { AP_INJECTOR } from '@aait/util-ap-injector';
import { AP } from '@aait/util-atlassian-connect-api-types';
import { Inject, Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let AP: any;

@Injectable({
  providedIn: 'root',
})
export class ApRequestService {
  constructor(@Inject(AP_INJECTOR) private ap: AP) {}

  get(url: string) {
    return new Promise((resolve) => {
      this.ap
        .request({
          url,
          type: 'GET',
        })
        .then((response: { body: string }) =>
          resolve(JSON.parse(response.body)),
        );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, data: any) {
    return new Promise((resolve) => {
      this.ap
        .request({
          url,
          data,
          type: 'POST',
        })
        .then((response: { body: string }) =>
          resolve(JSON.parse(response.body)),
        );
    });
  }
}
