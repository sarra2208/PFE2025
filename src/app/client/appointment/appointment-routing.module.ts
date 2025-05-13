import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentBookingComponent } from './appointment-booking/appointment-booking.component';

const routes: Routes = [
  { path: 'booking', title: 'Appointments' , component:AppointmentBookingComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { 
  
}
