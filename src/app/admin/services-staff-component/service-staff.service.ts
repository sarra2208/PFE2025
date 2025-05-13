import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, Observable, tap, throwError } from 'rxjs';
import { ServiceStaff } from './service-staff.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { environment } from 'environments/environment.development';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
@Injectable({
  providedIn: 'root',
})
export class ServiceStaffService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = `${environment.baseUrl}/service-staff`;
  isTblLoading = true;
  dataChange: BehaviorSubject<ServiceStaff[]> = new BehaviorSubject<ServiceStaff[]>([]);
  private _dialogData!: ServiceStaff;

  constructor(private httpClient: HttpClient, 
    private ks: KeycloakService
    ) {
    super();
    this.getAllServiceStaff();
  }

  get data(): ServiceStaff[] {
    return this.dataChange.value;
  }

  setDialogData(data: ServiceStaff): void {
    this._dialogData = data;
  }

  getDialogData(): ServiceStaff {
    return this._dialogData;
  }

  getAllServiceStaff(): void {
    this.isTblLoading = true;
    console.log('Fetching service staff data...');
    console.log(`Bearer ${this.ks.getToken()}`)
    this.subs.sink = this.httpClient.get<ServiceStaff[]>(this.API_URL,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
      )
  .subscribe({
      next: (data) => {
        this.isTblLoading = false;
        this.dataChange.next(data);
      },
      error: (error: HttpErrorResponse) => {
        this.isTblLoading = false;
        this.dataChange.next([]);
        console.error('Error fetching service staff:', error);
      },
    });
  }

  createServiceStaff(serviceStaff: ServiceStaff): Observable<ServiceStaff> {
    return this.httpClient.post<ServiceStaff>(this.API_URL, serviceStaff,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((newServiceStaff) => {
        this.dataChange.next([...this.dataChange.value, newServiceStaff]);
        this.setDialogData(newServiceStaff);
      }),
      catchError(this.handleError)
    );
  }

  updateServiceStaff(id: string, serviceStaff: ServiceStaff): Observable<ServiceStaff> {
    return this.httpClient.patch<ServiceStaff>(`${this.API_URL}/${id}`, serviceStaff,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((updatedServiceStaff) => {
        const current = this.dataChange.value;
        const idx = current.findIndex((e) => e.id === id);
        if (idx > -1) {
          const updatedData = [...current];
          updatedData[idx] = updatedServiceStaff;
          this.dataChange.next(updatedData);
          this.setDialogData(updatedServiceStaff);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteServiceStaff(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap(() => {
        this.dataChange.next(this.dataChange.value.filter((emp) => emp.id !== id));
      }),
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = `Error: ${error.status} - ${error.message}`;
    return throwError(() => new Error(message));
  }

  public getStaffNames(): Observable<Array<[string, string]>> {
    return this.httpClient.get<Array<[string, string]>>(`${environment.baseUrl}/staff/names`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    )
    .pipe(
      catchError(this.handleError)
    );
  }
  public getServiceNames(): Observable<Array<{name:string,id: string}>> {
    return this.httpClient.get<Array<{name:string,id: string}>>(`${environment.baseUrl}/service/names`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    )
    .pipe(
      catchError(this.handleError)
    );
  }
  deleteMultiple(ids: string[]): Observable<void> {
    return forkJoin(
      ids.map(id => this.deleteServiceStaff(id))
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  getFullNameById(id: string): Observable<string> {
    return this.httpClient.get<string>(`${environment.baseUrl}/staff/name/${id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
}