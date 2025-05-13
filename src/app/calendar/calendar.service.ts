import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from './calendar.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly API_URL = `${environment.baseUrl}/appointments`;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  dataChange: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  dialogData!: Appointment;

  constructor(private httpClient: HttpClient, private ks: KeycloakService) {}

  get data(): Appointment[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllCalendars(): Observable<Appointment[]> {
    return this.httpClient.get<Appointment[]>(this.API_URL, {
      headers: { Authorization: `Bearer ${this.ks.getToken()}` },
    }).pipe(
      catchError(this.errorHandler),
      // Map API response to ensure compatibility with Appointment model
      map((appointments: Appointment[]) => {
        return appointments.map(appointment => new Appointment(appointment));
      })
    );
  }

  addUpdateCalendar(appointment: Appointment): void {
    this.dialogData = appointment;
  }

  deleteCalendar(appointment: Appointment): void {
    this.dialogData = appointment;
  }

  errorHandler(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}