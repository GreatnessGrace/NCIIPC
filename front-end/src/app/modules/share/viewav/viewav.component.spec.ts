import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewavComponent } from './viewav.component';

describe('ViewavComponent', () => {
  let component: ViewavComponent;
  let fixture: ComponentFixture<ViewavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
