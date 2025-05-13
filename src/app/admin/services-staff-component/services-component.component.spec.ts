import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceStaffComponent } from './service-staff.component';

describe('ServicesComponentComponent', () => {
  let component: ServiceStaffComponent;
  let fixture: ComponentFixture<ServiceStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceStaffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
