import { TestBed } from '@angular/core/testing';

import { CookiestorageService } from './cookiestorage.service';

describe('CookiestorageService', () => {
  let service: CookiestorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookiestorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
