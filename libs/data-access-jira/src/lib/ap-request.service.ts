import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let AP: any;

@Injectable({
  providedIn: 'root',
})
export class ApRequestService {
  get(url: string) {
    return new Promise((resolve) => {
      AP.request({
        url,
        type: 'GET',
      }).then((response: { body: string }) =>
        resolve(JSON.parse(response.body)),
      );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, data: any) {
    return new Promise((resolve) => {
      AP.request({
        url,
        data,
        type: 'POST',
      }).then((response: { body: string }) =>
        resolve(JSON.parse(response.body)),
      );
    });
  }
}
