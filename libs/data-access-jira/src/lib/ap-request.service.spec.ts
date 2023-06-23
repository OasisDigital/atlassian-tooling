import { TestBed } from '@angular/core/testing';

import { ApRequestService } from './ap-request.service';

describe('ApRequestService', () => {
  let service: ApRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
