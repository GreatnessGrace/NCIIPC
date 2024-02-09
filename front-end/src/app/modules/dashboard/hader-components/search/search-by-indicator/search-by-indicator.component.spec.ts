import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByIndicatorComponent } from './search-by-indicator.component';

describe('SearchByIndicatorComponent', () => {
  let component: SearchByIndicatorComponent;
  let fixture: ComponentFixture<SearchByIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchByIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchByIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
