import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PCapBinaryComponent } from './p-cap-binary.component';

describe('PCapBinaryComponent', () => {
  let component: PCapBinaryComponent;
  let fixture: ComponentFixture<PCapBinaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PCapBinaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PCapBinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
