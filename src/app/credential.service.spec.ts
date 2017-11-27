import { TestBed, inject } from '@angular/core/testing';

import { CredentialService } from './credential.service';

describe('CredentialService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CredentialService]
    });
  });

  it('should be created', inject([CredentialService], (service: CredentialService) => {
    expect(service).toBeTruthy();
  }));
});
