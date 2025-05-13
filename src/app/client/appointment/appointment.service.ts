import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Employees } from './Employees.model';
import { environment } from 'environments/environment.development';
import { Clinic } from './Clinic.model';
import { Service } from './Service.model';

import { Appointment } from './Appointment.model';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';

export interface UnavailableSchedule {
  startDate: string; 
  endDate: string;
  status: string;
}


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly API_URL = environment.baseUrl;
   constructor(private httpClient: HttpClient
      , private ks: KeycloakService
   ) {
   }



  getEmployeeBySpeciality(speciality: string): Observable<Employees[]> {
      return this.httpClient.get<Employees[]>(`${this.API_URL}/staff/speciality/${speciality}`,
        { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
      );
  }
     
  getListOfAllClinics(): Observable<Clinic[]> {
    return this.httpClient.get<Clinic[]>(`${this.API_URL}/clinics`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    ) ;
  }
  getAllServicesByClinicId(clinic_id:number ): Observable<Service[]> {
    return this.httpClient.get<Service[]>(`${this.API_URL}/service/clinic/${clinic_id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    );
  }
  
  getUnavailableSchedules(date: string | number | Date,  currentDateTime: string | Date, serviceStaffId?: string, patientId?: string ): Observable<UnavailableSchedule[]> {
    const dateStr = date instanceof Date ? date.toISOString() : date.toString();
    const dateTimeStr = currentDateTime instanceof Date   ? currentDateTime.toISOString()  : currentDateTime.toString();
    let params = new HttpParams()
    .set('date', dateStr)
    .set('currentDateTime', dateTimeStr);

  if (serviceStaffId) {
    params = params.set('serviceStaffId', serviceStaffId);
  }

  if (patientId) {
    params = params.set('patientId', patientId);
  }

  
  return this.httpClient.get<UnavailableSchedule[]>(`${this.API_URL}/appointments/unavailable-schedules`, { params , headers: {  Authorization: `Bearer ${this.ks.getToken()}` } },
    
  );
}

  saveAppointment(appointment: Appointment): Observable<Appointment> {
    console.table(appointment);
    const payload = {
      ...appointment,
      startDate: appointment.startDate ? this.formatDateForApi(appointment.startDate ) : null,
      endDate: appointment.endDate ? this.formatDateForApi(appointment.endDate) : null,
      date: appointment.date ? this.formatDateForApi(appointment.date) : null
    };
    
    return this.httpClient.post<Appointment>(
      `${this.API_URL}/appointments`, 
      payload,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    ).pipe(
      catchError(error => {
        console.error('Error saving appointment:', error);
        return throwError(() => error);
      })
    );
  }
  
  toLocalISOString(date: Date): string {

    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    // const hours = String(date.getHours()).padStart(2, '0');
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    // return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    return date.toISOString();
  }

  deleteSrviceStaff(id:string | null):void{
    if(id !== null)
       this.httpClient.delete<Appointment>(`${this.API_URL}/appointments/${id}`,
        { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }});
  }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStaffByServiceId(serviceId: string): Observable< Array<string> > {
    const cleanedServiceId = serviceId.replace(/'/g, '');
    return this.httpClient.get< Array<string> >(`${this.API_URL}/service-staff/by-service/${cleanedServiceId}`)
    
  }
  getStaffById(staffId: string): Observable<Employees> {
    return this.httpClient.get<Employees>(`${this.API_URL}/staff/${staffId}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    );
  }

  findStaffServiceId(staffId: string, serviceId: string): Observable<string> {
    const params = {
      staffId: staffId,
      serviceId: serviceId
    };
    
    return this.httpClient.get<string>(`${this.API_URL}/service-staff/find-id`, { params ,  headers: {  Authorization: `Bearer ${this.ks.getToken()}` }});
  }

  private formatDateForApi(dateUtc: Date | string | null): string | null {
    if (!dateUtc) return null;
  
    const date = dateUtc instanceof Date ? dateUtc : new Date(dateUtc);
  
  

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    //  utc ->> isoString
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  deleteAppointment(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/appointments/${id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    );
  }
  
  getShiftSchedule(serviceStaffId: string): Observable<string | null> {
    return this.httpClient.get<string | null>(`${this.API_URL}/service-staff/shift-schedule/${serviceStaffId}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    );
  }


}
