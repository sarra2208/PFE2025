import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ServiceMed } from './ServiceMed.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { environment } from 'environments/environment.development';
//import { ClinicsService } from '../clinics/clinics.service';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = `${environment.baseUrl}/service`;
  isTblLoading = true;
  dataChange: BehaviorSubject<ServiceMed[]> = new BehaviorSubject<ServiceMed[]>([]);
  
  private _dialogData!: ServiceMed;
  
  constructor(private httpClient: HttpClient,
    private ks:KeycloakService,
   // private clinicsService: ClinicsService=new ClinicsService(httpClient)
   
  ) {
    super();
    this.getAllServices();
  }

  get data(): ServiceMed[] {
    return this.dataChange.value;
  }

  setDialogData(ServiceMed: ServiceMed) {
    this._dialogData = ServiceMed;
  }

  getDialogData(): ServiceMed {
    return this._dialogData;
  }



  //------- CRUD Operations -------
  getAllServices(): void {
    this.isTblLoading = true;
    this.subs.sink = this.httpClient.get<ServiceMed[]>(this.API_URL,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).subscribe({
      next: (data) => {
        this.isTblLoading = false;
        this.dataChange.next(data);
      },
      error: (error: HttpErrorResponse) => {
        this.isTblLoading = false;
        console.error('Error fetching services:', error);
        this.dataChange.next([]);
      },
    });
  }

  getServicesByClinicId(clinicId: string): Observable<ServiceMed[]> {
    return this.httpClient.get<ServiceMed[]>(`${this.API_URL}/clinic/${clinicId}`,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(`Failed to get services: ${error.message}`));
      })
    );
  }

  getServiceById(id: string): Observable<ServiceMed> {
    return this.httpClient.get<ServiceMed>(`${this.API_URL}/${id}`,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(`Failed to get ServiceMed: ${error.message}`));
      })
    );
  }

  addService(ServiceMed: ServiceMed): Observable<ServiceMed> {
    const formData = new FormData();
    
    if (ServiceMed.uploadImg) {
      formData.append('file', ServiceMed.uploadImg);
    }
    formData.append('name', ServiceMed.name);
    formData.append('description', ServiceMed.description);

    return this.httpClient.post<ServiceMed>(`${this.API_URL}/addService`, formData, {
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    }).pipe(
      tap((newService) => {
        const currentData = this.dataChange.value;
        this.dataChange.next([...currentData, newService]);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(`Failed to add ServiceMed: ${error.message}`));
      })
    );
  }

  updateService(id: string, ServiceMed: ServiceMed): Observable<ServiceMed> {
    const formData = new FormData();
    
    if (ServiceMed.uploadImg) {
      formData.append('file', ServiceMed.uploadImg);
    }
    if(ServiceMed.name)
    formData.append('name', ServiceMed.name);
    if(ServiceMed.description)
    formData.append('description', ServiceMed.description);

    return this.httpClient.patch<ServiceMed>(`${this.API_URL}/${id}`, formData,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((updatedService) => {
        const current = this.dataChange.value;
        const idx = current.findIndex(s => s.id === id);
        
        if (idx > -1) {
          const updatedData = [...current];
          updatedData[idx] = updatedService;
          this.dataChange.next(updatedData);
        } else {
          this.getAllServices();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(`Failed to update ServiceMed: ${error.message}`));
      })
    );
  }

  deleteService(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`,
       { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap(() => {
        const currentData = this.dataChange.value;
        this.dataChange.next(currentData.filter(s => s.id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getDataChangeObservable(): Observable<ServiceMed[]> {
    return this.dataChange.asObservable();
  }
  // getClinics(): Observable<{id: string, name: string}[]> {
  //   return this.clinicsService.getListOfAllClinics().pipe(
  //     map(clinics => clinics.map(clinic => ({
  //       id: clinic.id?.toString() || '',
  //       name: clinic.name || ''
  //     })))
  //   );
  // }
}