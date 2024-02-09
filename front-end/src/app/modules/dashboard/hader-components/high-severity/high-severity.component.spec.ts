import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighSeverityComponent } from './high-severity.component';

describe('HighSeverityComponent', () => {
  let component: HighSeverityComponent;
  let fixture: ComponentFixture<HighSeverityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighSeverityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighSeverityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
