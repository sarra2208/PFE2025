import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { Appointment } from 'app/calendar/calendar.model';
import { environment } from 'environments/environment.development';
import { BehaviorSubject, catchError, map, throwError } from 'rxjs';
import { Consultation } from './model/consultation.model';
import { Prescription } from './model/prescription.model';
import { PrescriptionDetail } from './model/prescriptionDetail.model';
import { MedicalTest } from './model/medicalTest.model';


@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private prescriptionIdSource = new BehaviorSubject<string | null>(null);
  currentPrescriptionId = this.prescriptionIdSource.asObservable();
  changePrescriptionId(id: string | null) {
    this.prescriptionIdSource.next(id);
  }
  
  private readonly API_URL = environment.baseUrl;
  constructor(private httpClient: HttpClient, private ks: KeycloakService) {}
  getTodayConfirmedAppointments(staff_id:string){
    return this.httpClient.get<Appointment[]>(`${this.API_URL}/appointments/confirmed/today/${staff_id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
        catchError(this.errorHandler),
        map((appointments: Appointment[]) => {
          return appointments.map(appointment => new Appointment(appointment));
        })
      );
  }

saveConsultation(consultation:Consultation){
  console.table(consultation);
  return this.httpClient.post<Appointment>(
    `${this.API_URL}/consultations/add`,
     consultation,
    { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
  )
}
 private errorHandler(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => new Error(errorMessage));
  }  
  savePrescription(prescription:Prescription){
    console.table(prescription);
    return this.httpClient.post<Prescription>(
      `${this.API_URL}/prescriptions`,
      prescription,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    )
  }
  savePrescriptionDetail(prescriptionDetail:PrescriptionDetail){
    console.table(prescriptionDetail);
    return this.httpClient.post<PrescriptionDetail>(
      `${this.API_URL}/prescription-details`,
      prescriptionDetail,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
    )
  }


  getPrescriptionDetail(prescription_id:string){
    return this.httpClient.get<PrescriptionDetail[]>(`${this.API_URL}/prescription-details/prescription/${prescription_id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
        catchError(this.errorHandler),
        map((prescriptionDetail: PrescriptionDetail[]) => {
          return prescriptionDetail.map(prescriptionDetail => new PrescriptionDetail(prescriptionDetail));
        })
      );
  }


    appointmentCompleted(id: string){
      const appointment={status:"Completed"}
    
      return this.httpClient.patch<Appointment>(`${this.API_URL}/appointments/${id}`,appointment,
              { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } } )
      .pipe(catchError(this.errorHandler))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMedicalTests(prescription_id:string){
      return this.httpClient.get<MedicalTest>(
        `${this.API_URL}/medical-tests/prescription/${prescription_id}`,
        { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
      )
    }
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveMedicalTest(medicalTest:MedicalTest){
      return this.httpClient.post<MedicalTest>(
        `${this.API_URL}/medical-tests`,
        medicalTest,
        { headers: {  Authorization: `Bearer ${this.ks.getToken()}` }}
      )
    }


}
