import { TestBed } from '@angular/core/testing';

import { ApService } from './ap.service';

describe('ApService', () => {
  let service: ApService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
