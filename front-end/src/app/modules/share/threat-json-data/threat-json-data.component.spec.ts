import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreatJsonDataComponent } from './threat-json-data.component';

describe('ThreatJsonDataComponent', () => {
  let component: ThreatJsonDataComponent;
  let fixture: ComponentFixture<ThreatJsonDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreatJsonDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreatJsonDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
