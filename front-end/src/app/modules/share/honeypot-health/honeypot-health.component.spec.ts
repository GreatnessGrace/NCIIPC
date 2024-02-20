import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoneypotHealthComponent } from './honeypot-health.component';

describe('HoneypotHealthComponent', () => {
  let component: HoneypotHealthComponent;
  let fixture: ComponentFixture<HoneypotHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoneypotHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoneypotHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
