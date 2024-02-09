import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreatIntelEventsComponent } from './threat-intel-events.component';

describe('ThreatIntelEventsComponent', () => {
  let component: ThreatIntelEventsComponent;
  let fixture: ComponentFixture<ThreatIntelEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreatIntelEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreatIntelEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
