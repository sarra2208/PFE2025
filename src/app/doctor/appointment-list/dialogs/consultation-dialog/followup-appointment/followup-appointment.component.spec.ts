import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowupAppointmentComponent } from './followup-appointment.component';

describe('FollowupAppointmentComponent', () => {
  let component: FollowupAppointmentComponent;
  let fixture: ComponentFixture<FollowupAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowupAppointmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowupAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
