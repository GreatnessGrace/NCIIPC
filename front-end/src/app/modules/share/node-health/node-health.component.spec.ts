import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeHealthComponent } from './node-health.component';

describe('NodeHealthComponent', () => {
  let component: NodeHealthComponent;
  let fixture: ComponentFixture<NodeHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
