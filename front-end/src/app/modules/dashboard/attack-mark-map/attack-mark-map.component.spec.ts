import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackMarkMapComponent } from './attack-mark-map.component';

describe('AttackMarkMapComponent', () => {
  let component: AttackMarkMapComponent;
  let fixture: ComponentFixture<AttackMarkMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttackMarkMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttackMarkMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
