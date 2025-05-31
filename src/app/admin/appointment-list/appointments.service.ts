import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Appointment } from './appointment.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { environment } from 'environments/environment.development';
import { forkJoin, map } from 'rxjs';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = `${environment.baseUrl}/appointments`;
  isTblLoading = true;
  dataChange: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  private _dialogData!: Appointment;

  constructor(
    private httpClient: HttpClient,
    private ks:KeycloakService
  ) {
    super();
    this.getAllAppointments();
  }

  get data(): Appointment[] {
    return this.dataChange.value;
  }

  set DialogData(appointment: Appointment) {
    this._dialogData = appointment;
  }

  setDialogData(data: Appointment): void {
    this._dialogData = data;
  }

  getDialogData(): Appointment {
    return this._dialogData;
  }

  getAllAppointments(): void {
    console.log('url: '+ this.API_URL)
    this.isTblLoading = true;
    
    this.subs.sink = this.httpClient.get<Appointment[]>(this.API_URL,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).subscribe({
      next: (data) => {
        this.isTblLoading = false;
        console.log('Fetched appointments:', data);
        this.dataChange.next(data);
      },
      error: (error: HttpErrorResponse) => {
        this.isTblLoading = false;
        console.error('Error fetching appointments:', error);
        this.dataChange.next([]);
      },
    });
  }

  getListOfAllAppointments(): Observable<Appointment[]> {
    return this.httpClient.get<Appointment[]>(this.API_URL,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.httpClient.get<Appointment>(`${this.API_URL}/${id}`,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    );
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    console.log('Adding appointment:', appointment);
    
    return this.httpClient.post<Appointment>(this.API_URL, appointment,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((newAppointment) => {
        console.log('Add response:', newAppointment);
        const currentData = this.dataChange.value;
        this.dataChange.next([...currentData, newAppointment]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Add error:', error);
        return throwError(() => new Error(`Failed to add appointment: ${error.status} - ${error.message}`));
      })
    );
  }

  updateAppointment(id: string, appointment: Appointment): Observable<Appointment> {
    console.log('Updating appointment with id:', id, 'Data:', appointment);

    return this.httpClient.patch<Appointment>(`${this.API_URL}/${id}`,appointment,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } } ).pipe(
      tap((apiResponse) => {
        console.log('Update response:', apiResponse);
        const current = this.dataChange.value;
        const idx = current.findIndex((a) => a.id === id);
        
        if (idx > -1) {
          const updatedData = [...current];
          updatedData[idx] = apiResponse;
          this.dataChange.next(updatedData);
        } else {
          console.warn(`Appointment with id ${id} not found in dataChange`);
          this.getAllAppointments();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update error:', error);
        return throwError(() => new Error(`Failed to update appointment: ${error.status} - ${error.message}`));
      })
    );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`,
         { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    )
    .pipe(
      tap(() => {
        console.log(`Appointment with id ${id} deleted successfully.`);
        const currentData = this.dataChange.value;
        this.dataChange.next(currentData.filter(a => a.id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting appointment with id ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteMultipleAppointments(ids: string[]): Observable<void> {
    return forkJoin(
      ids.map(id => this.deleteAppointment(id))
    ).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error deleting multiple appointments:', error);
        return throwError(() => new Error('Failed to delete one or more appointments'));
      })
    );
  }

  getDataChangeObservable(): Observable<Appointment[]> {
    return this.dataChange.asObservable();
  }
}