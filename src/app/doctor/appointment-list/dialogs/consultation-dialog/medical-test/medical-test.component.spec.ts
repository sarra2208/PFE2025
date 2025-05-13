import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalTestComponent } from './medical-test.component';

describe('MedicalTestComponent', () => {
  let component: MedicalTestComponent;
  let fixture: ComponentFixture<MedicalTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicalTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
