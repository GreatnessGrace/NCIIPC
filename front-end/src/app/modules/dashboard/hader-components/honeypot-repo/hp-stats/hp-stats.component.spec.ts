import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpStatsComponent } from './hp-stats.component';

describe('HpStatsComponent', () => {
  let component: HpStatsComponent;
  let fixture: ComponentFixture<HpStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HpStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
