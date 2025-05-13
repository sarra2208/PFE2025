import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicSelectionComponent } from './clinic-selection.component';

describe('ClinicSelectionComponent', () => {
  let component: ClinicSelectionComponent;
  let fixture: ComponentFixture<ClinicSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClinicSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
