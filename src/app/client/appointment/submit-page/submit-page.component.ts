import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Appointment } from '../Appointment.model';
import { Output , EventEmitter } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-submit-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatChipsModule
  ],
  templateUrl: './submit-page.component.html',
  styleUrls: ['./submit-page.component.scss']
})
export class SubmitPageComponent {
  @Input() serviceStaffId!: string 
  @Input() selectedDate!: Date 
  @Input() selectedServiceId!: number 
  @Input() selectedEmployeeId!: number 
  @Input() staffName!: string
  @Input() serviceName!: string
  @Output() saveAppointment=new EventEmitter<Appointment>
  @Output() completeAppointment= new EventEmitter<{"iscompleted": boolean,description:string,type:string}>();

  selectedPatientId:number=1;
  types: string[] = ["Consultation", "Follow up", "Emergency"];
  selectedType: string = "Consultation";
  description: string = "";
  status: string = 'Pending'; 
  patientId: number | null = 12345;

  submitRequest() {
    console.log('Submitting request:', {
      staffId: this.serviceStaffId,
      patientId: this.patientId,
      date: this.selectedDate,
      type: this.selectedType,
      description: this.description,
      status: this.status
    });
    const appointment = new Appointment({
      serviceStaffId: this.serviceStaffId,
      patientId: this.selectedPatientId.toString(),
      date: this.selectedDate,
      description: this.description,
      status: this.status,
      type: this.selectedType
    });
    
    this.saveAppointment.emit(appointment);
    this.completeAppointment.emit({iscompleted: true, description: this.description, type: this.selectedType});
    this.status = 'Submitted';
  }
  
   getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected'
    };
    return statusClassMap[status] || 'status-pending';
  }
  retryLoading() {
    window.location.reload();
  }
}