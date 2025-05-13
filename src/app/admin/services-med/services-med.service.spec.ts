import { TestBed } from '@angular/core/testing';

import { ServiceService } from './services-med.service';

describe('ServicesMedService', () => {
  let service: ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
