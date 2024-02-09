import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigHpComponent } from './config-hp.component';

describe('ConfigHpComponent', () => {
  let component: ConfigHpComponent;
  let fixture: ComponentFixture<ConfigHpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigHpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigHpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
