import { TestBed } from '@angular/core/testing';

import { RightClickService } from './right-click.service';

describe('RightClickService', () => {
  let service: RightClickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RightClickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
