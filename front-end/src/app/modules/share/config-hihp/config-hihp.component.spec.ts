import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigHihpComponent } from './config-hihp.component';

describe('ConfigHihpComponent', () => {
  let component: ConfigHihpComponent;
  let fixture: ComponentFixture<ConfigHihpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigHihpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigHihpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
