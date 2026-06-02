import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hospital } from './hospital';

describe('Hospital', () => {
  let component: Hospital;
  let fixture: ComponentFixture<Hospital>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hospital]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hospital);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
