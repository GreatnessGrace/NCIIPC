import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoublePieChartComponent } from './double-pie-chart.component';

describe('DoublePieChartComponent', () => {
  let component: DoublePieChartComponent;
  let fixture: ComponentFixture<DoublePieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoublePieChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoublePieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
