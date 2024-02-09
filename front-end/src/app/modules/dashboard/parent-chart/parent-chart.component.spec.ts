import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentChartComponent } from './parent-chart.component';

describe('ParentChartComponent', () => {
  let component: ParentChartComponent;
  let fixture: ComponentFixture<ParentChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
