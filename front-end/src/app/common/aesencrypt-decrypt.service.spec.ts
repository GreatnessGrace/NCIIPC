import { TestBed } from '@angular/core/testing';

import { AESEncryptDecryptService } from './aesencrypt-decrypt.service';

describe('AESEncryptDecryptService', () => {
  let service: AESEncryptDecryptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AESEncryptDecryptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
