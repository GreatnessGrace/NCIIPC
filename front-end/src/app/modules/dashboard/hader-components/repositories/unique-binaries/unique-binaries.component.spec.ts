import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniqueBinariesComponent } from './unique-binaries.component';

describe('UniqueBinariesComponent', () => {
  let component: UniqueBinariesComponent;
  let fixture: ComponentFixture<UniqueBinariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniqueBinariesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniqueBinariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
