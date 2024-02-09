import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpConfigComponent } from './hp-config.component';

describe('HpConfigComponent', () => {
  let component: HpConfigComponent;
  let fixture: ComponentFixture<HpConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HpConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
