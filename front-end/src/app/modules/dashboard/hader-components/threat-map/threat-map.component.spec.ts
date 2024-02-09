import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreatMapComponent } from './threat-map.component';

describe('ThreatMapComponent', () => {
  let component: ThreatMapComponent;
  let fixture: ComponentFixture<ThreatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreatMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
