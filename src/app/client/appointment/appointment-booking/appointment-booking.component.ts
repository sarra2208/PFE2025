/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OnInit } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AppointmentService } from '../appointment.service';
import { Clinic } from '../Clinic.model';
import { Service } from '../Service.model';
import { Employees } from "../Employees.model";
import { ChooseDateComponent } from '../choose-date/choose-date.component';
import { ClinicSelectionComponent } from '../clinic-selection/clinic-selection.component';
import { EmployeeSelectionComponent } from '../employee-selection/employee-selection.component';
import { ServiceSelectionComponent } from '../service-selection/service-selection.component';
import { schedulesServices } from '../SchedulesServices.model';
import { SubmitPageComponent } from '../submit-page/submit-page.component';
import { Appointment } from '../Appointment.model';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatDatepickerModule, 
    MatNativeDateModule,
    ChooseDateComponent,
    ClinicSelectionComponent,
    EmployeeSelectionComponent,
    ServiceSelectionComponent,
    SubmitPageComponent ,
    MatSnackBarModule  
  ],
  templateUrl: './appointment-booking.component.html',
  styleUrl: './appointment-booking.component.scss'
})
export class AppointmentBookingComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper: any;
  clinics: Clinic[] = [];
  services: Service[] = [];
  employees: Employees[] = [];
  unAvailableDates: schedulesServices[] = [];
  selectedClinicId: number | null = null;
  selectedServiceId: number | null = null;
  selectedEmployeeId: number | null = null;
  selectedDate: Date | null = null;
  serviceStaffId: string | null = null;
  appointmentSavedId: string | null = null;
  description:string=""
  shiftSchedule:string="";
  type:string|null=null;
  patientId: string | null = "123";
  listOfStaffId: Array<string> = [];
  isLinear = false;
  completed: boolean = false;
  private subList: Subscription[] = [];
  nextButtonDisabled = true;
  serviceDefaultImage = "assets/images/user/service.png";

  time: { start: string, end: string } = { start: '', end: '' };
  appointmentSaved: boolean = false;
  staffName:string|null=null;
  serviceName:string|null=null;


  constructor(
    
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getClinics();
  }

  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
    clinic: [null, Validators.required], 
  });

  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required],
  });

  getClinics() {
    this.appointmentService.getListOfAllClinics().subscribe((clinics: Clinic[]) => {
      this.clinics = clinics;
    });
  }

  getServicesByClinicId() {
    if (this.selectedClinicId) {
      this.nextButtonDisabled = true;
      const sub = this.appointmentService.getAllServicesByClinicId(this.selectedClinicId).subscribe((services) => {
        this.services = services;
      });
      this.subList.push(sub);
    }
  }


  getServiceSchedules(date: string) { 
    if (this.selectedEmployeeId && this.selectedServiceId) {
      this.nextButtonDisabled = true;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const formattedDate = now.toISOString().slice(0, 19);
      const sub = this.appointmentService.getUnavailableSchedules(
        date, 
        formattedDate, 
        this.serviceStaffId!, 
        this.patientId!
      ).subscribe((schedules) => {
        this.unAvailableDates = schedules;
      });
      this.subList.push(sub);
    }
  }

  onClinicSelected(id: number): void {
    this.selectedClinicId = id;
    this.nextButtonDisabled = false;
  }



  onEmployeeSelected(staff:{id: number, name:string}): void {
    this.selectedEmployeeId = staff.id;
    this.staffName = staff.name;
    this.nextButtonDisabled = false;
    
  }

  onDateSelected(date: Date | null) {
    console.log('Selected date:', date);
    this.selectedDate = date;
    this.nextButtonDisabled = false;
  }

  onCompleteAppointment(comp:{iscompleted:boolean,description:string,type:string}): void {
    this.completed = comp.iscompleted;
    this.description = comp.description;
    this.type=comp.type;
    this.saveAppointment();

  }


  getTime(time: { start: string, end: string }) {
    this.time = time;
    this.nextButtonDisabled = false;
  }

  saveAppointment() {
    this.appointmentSaved = false;

    if (!this.selectedDate || !this.time.start || !this.time.end || !this.serviceStaffId) {
      console.error('Missing required fields');
      return;
    }

    const startDate = new Date(this.selectedDate);
    const [startHours, startMinutes] = this.time.start.split(':').map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(this.selectedDate);
    const [endHours, endMinutes] = this.time.end.split(':').map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);
  
    const appointment = new Appointment({
      id : this.appointmentSavedId  ,
      serviceStaffId: this.serviceStaffId,
      patientId: this.patientId!,
      description: this.description,
      type: this.type,
      status: this.completed ?  'Pending' : 'Inactive',
      date: this.selectedDate,
      startDate: startDate,
      endDate: endDate,
  

    });

    const sub = this.appointmentService.saveAppointment(appointment).subscribe({
      next: (response) => {
        console.log('Appointment saved successfully:', response);
        this.appointmentSavedId = response.id! ;
        this.nextButtonDisabled = false;
        this.unAvailableDates = [
          ...this.unAvailableDates,
          {
            startDate: response.startDate ? `${response.startDate}` : '',
            endDate: response.endDate ? `${response.endDate}` : '',
            
            status: this.completed ? 'Pending' : 'Inactive'
          }
        ];
        this.appointmentSaved = true;
        if(this.completed){
          this.showSnackbar("Appointment booked successfully!","success");
          this.resetStepper(); 
        }
        else{
          setTimeout(() => { this.deleteAppoitment(this.appointmentSavedId!); }, 5*60*1000);
       
        }
        
      },
      error: (error) => {
        console.error('Error saving appointment:', error);
      }
    });
   
    this.subList.push(sub);
  }
  deleteAppoitment( id:string){
    if(!this.completed){
        this.appointmentService.deleteAppointment(id).subscribe({
          next: () => {
            this.showSnackbar("Appointment not booked!","error");
            this.resetStepper(); 
          }
        });
  }
  }

  getStaffByServiceId(): void {
    if (!this.selectedServiceId) return;
    this.employees = [];
 
    const sub = this.appointmentService.getStaffByServiceId(this.selectedServiceId.toString()).subscribe({
      next: (staffIds) => {
        this.listOfStaffId = staffIds;
        this.listOfStaffId.forEach(staffId => {
          this.appointmentService.getStaffById(staffId).subscribe((employee) => {
            this.employees.push(employee);
          });
        });
      },
      error: (error) => {
        console.error('Error fetching staff by service:', error);
      }
    });
    this.subList.push(sub);
  }

  onServiceSelected(selection: {id: number,name:string}): void {
    this.selectedServiceId = selection.id
    this.serviceName = selection.name;
    this.nextButtonDisabled = false;
  }

  unable_next_btn(): void {
    this.nextButtonDisabled = false;
  }

  getunAvailableDates() {
    if (this.selectedEmployeeId && this.selectedServiceId) {
    
      this.appointmentService
      .findStaffServiceId( this.selectedEmployeeId.toString(), this.selectedServiceId.toString() )
      .subscribe((serviceStaffId) => {
        this.serviceStaffId = serviceStaffId;
        this.getShiftSchedule();
        if(this.selectedDate)
        this.getServiceSchedules(this.selectedDate.toISOString());
      });
    }
  }
  resetStepper() {
    this.selectedDate = null;
    this.time = { start: '', end: '' };
    this.selectedEmployeeId = null;
    this.selectedServiceId = null;
    this.serviceStaffId = null;
    this.selectedClinicId = null;
    this.selectedDate=null
    this.completed =false
    this.appointmentSaved = false;
    this.appointmentSavedId = null;
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
    this.fourthFormGroup.reset();
    this.services = [];
    this.employees = [];
    this.unAvailableDates = [];
    this.listOfStaffId = [];
    this.shiftSchedule = "";
    this.staffName = null;
    this.serviceName = null;
    this.nextButtonDisabled = true;
    this.stepper.reset();
  }



  getShiftSchedule(){
    this.appointmentService.getShiftSchedule(this.serviceStaffId!).subscribe((schedule) => {
        console.log("*******************",schedule)
        this.shiftSchedule = schedule ?? "";
    })
  }
  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
  
  private showSnackbar(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }
}