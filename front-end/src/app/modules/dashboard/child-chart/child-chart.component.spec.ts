import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildChartComponent } from './child-chart.component';

describe('ChildChartComponent', () => {
  let component: ChildChartComponent;
  let fixture: ComponentFixture<ChildChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
