import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from 'app/client/appointment/Appointment.model'
import { ChooseDateComponent } from 'app/client/appointment/choose-date/choose-date.component';
import { AppointmentService } from 'app/client/appointment/appointment.service';
import { schedulesServices } from 'app/client/appointment/SchedulesServices.model';


@Component({
  selector: 'app-followup-appointment',
  standalone: true,
  imports: [CommonModule, ChooseDateComponent],
  templateUrl: './followup-appointment.component.html',
  styleUrl: './followup-appointment.component.scss'
})
export class FollowupAppointmentComponent {
  constructor(private appointmentService:AppointmentService){}
  @Input() appointment!:Appointment;
   appointmentSavedId:string|null=null;


  shiftSchedule:string="mon-fri 08:00-17:00";
  unAvailableDates: schedulesServices[] = [];
  public selectedDate: Date | null = null;
  time: { start: string, end: string } = { start: '', end: '' };
  getServiceSchedules(date: string) { 
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const formattedDate = now.toISOString().slice(0, 19);
      //onst sub = 
       this.appointmentService.getUnavailableSchedules(
        date, 
        formattedDate, 
        this.appointment.serviceStaffId,
        this.appointment.patientId

      ).subscribe((schedules) => {
        this.unAvailableDates = schedules;
      });
     // this.subList.push(sub);
    }
    getShiftSchedule(){
      this.appointmentService.getShiftSchedule(this.appointment.serviceStaffId).subscribe((schedule) => {
          this.shiftSchedule = schedule ?? "";
      })
    }
    onDateSelected(date: Date | null) {
      console.log('Selected date:', date);
      this.selectedDate = date;
    
    }

    getTime(time: { start: string, end: string } | null) {
      if (time) {
        this.time = time;
      } else {
        this.time = { start: '', end: '' }; 
      }
    }

    saveAppointment() {
      // this.appointmentSaved = false;
   
       if (!this.selectedDate || !this.time.start || !this.time.end) {
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
         serviceStaffId: this.appointment.serviceStaffId,
         patientId: this.appointment.patientId,
         description: "",
         type: "Follow up",
         status: "Confirmed",
         date: this.selectedDate,
         startDate: startDate,
         endDate: endDate,
       });
       //const sub = 
       this.appointmentService.saveAppointment(appointment).subscribe({
        next: (response) => {
          console.log('Appointment saved successfully:', response);
            this.appointmentSavedId = response.id! ;
        }})
      }
   

}
