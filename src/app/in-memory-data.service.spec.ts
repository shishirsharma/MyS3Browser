import { TestBed, inject } from '@angular/core/testing';

import { InMemoryDataServiceService } from './in-memory-data-service.service';

describe('InMemoryDataServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InMemoryDataServiceService]
    });
  });

  it('should be created', inject([InMemoryDataServiceService], (service: InMemoryDataServiceService) => {
    expect(service).toBeTruthy();
  }));
});
