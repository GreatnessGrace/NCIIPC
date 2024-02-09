import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployedHoneypotsComponent } from './deployed-honeypots.component';

describe('DeployedHoneypotsComponent', () => {
  let component: DeployedHoneypotsComponent;
  let fixture: ComponentFixture<DeployedHoneypotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeployedHoneypotsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeployedHoneypotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
