import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpBlueprintComponent } from './hp-blueprint.component';

describe('HpBlueprintComponent', () => {
  let component: HpBlueprintComponent;
  let fixture: ComponentFixture<HpBlueprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpBlueprintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HpBlueprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
