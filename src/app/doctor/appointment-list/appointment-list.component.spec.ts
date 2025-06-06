import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsComponent } from './appointment-list.component';

describe('AppointmentListComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
