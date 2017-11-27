import { TestBed, inject } from '@angular/core/testing';

import { AwsS3Service } from './aws-s3.service';

describe('AwsS3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwsS3Service]
    });
  });

  it('should be created', inject([AwsS3Service], (service: AwsS3Service) => {
    expect(service).toBeTruthy();
  }));
});
