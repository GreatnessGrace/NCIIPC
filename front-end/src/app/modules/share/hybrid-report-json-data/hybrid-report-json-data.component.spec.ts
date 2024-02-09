import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HybridReportJsonDataComponent } from './hybrid-report-json-data.component';

describe('HybridReportJsonDataComponent', () => {
  let component: HybridReportJsonDataComponent;
  let fixture: ComponentFixture<HybridReportJsonDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HybridReportJsonDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HybridReportJsonDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
