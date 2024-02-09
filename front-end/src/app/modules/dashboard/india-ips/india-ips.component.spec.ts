import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiaIpsComponent } from './india-ips.component';

describe('IndiaIpsComponent', () => {
  let component: IndiaIpsComponent;
  let fixture: ComponentFixture<IndiaIpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndiaIpsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndiaIpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
