import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoneypotDetailsComponent } from './honeypot-details.component';

describe('HoneypotDetailsComponent', () => {
  let component: HoneypotDetailsComponent;
  let fixture: ComponentFixture<HoneypotDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoneypotDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoneypotDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
