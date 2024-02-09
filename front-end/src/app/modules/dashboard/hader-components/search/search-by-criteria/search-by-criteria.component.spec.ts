import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByCriteriaComponent } from './search-by-criteria.component';

describe('SearchByCriteriaComponent', () => {
  let component: SearchByCriteriaComponent;
  let fixture: ComponentFixture<SearchByCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchByCriteriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchByCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
