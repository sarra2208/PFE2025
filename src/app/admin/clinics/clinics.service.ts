import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Clinic } from './Clinic.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { environment } from 'environments/environment.development';
import { forkJoin, map } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ClinicsService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = `${environment.baseUrl}/clinics`;
  isTblLoading = true;
  dataChange: BehaviorSubject<Clinic[]> = new BehaviorSubject<Clinic[]>([]);
  private _dialogData!: Clinic;

  constructor(private httpClient: HttpClient) {
    super();
    this.getAllClinics();
  }

 




  get data(): Clinic[] {
    return this.dataChange.value;
  }

  set DialogData(clinic: Clinic) {
    this._dialogData = clinic;
  }

  setDialogData(data: Clinic): void {
    this._dialogData = data;
  }

  getDialogData(): Clinic {
    return this._dialogData;
  }

  getAllClinics(): void {
    this.isTblLoading = true;
    this.subs.sink = this.httpClient.get<Clinic[]>(this.API_URL).subscribe({
      next: (data) => {
        this.isTblLoading = false;
        console.log('Fetched clinics:', data);
        this.dataChange.next(data);
      },
      error: (error: HttpErrorResponse) => {
        this.isTblLoading = false;
        console.error('Error fetching clinics:', error);
        this.dataChange.next([]);
      },
    });
  }

  getListOfAllClinics(): Observable<Clinic[]> {
    return this.httpClient.get<Clinic[]>(this.API_URL);
  }

  getClinicById(id: number): Observable<Clinic> {
    return this.httpClient.get<Clinic>(`${this.API_URL}/${id}`);
  }

  addClinic(clinic: Clinic): Observable<Clinic> {
    const formData = new FormData();
    
    if (clinic.uploadImg) {
      formData.append('file', clinic.uploadImg as File);
    }
    
    formData.append('name', clinic.name.trim());
    formData.append('email', clinic.email.trim());
    formData.append('phone', clinic.phone.trim());
    formData.append('address', clinic.address.trim());

    console.log('Adding clinic:', clinic);

    return this.httpClient.post<Clinic>(`${this.API_URL}/addClinic`, formData, {
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    }).pipe(
      tap((newClinic) => {
        console.log('Add response:', newClinic);
        const currentData = this.dataChange.value;
        this.dataChange.next([...currentData, newClinic]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Add error:', error);
        return throwError(() => new Error(`Failed to add clinic: ${error.status} - ${error.message}`));
      })
    );
  }

  updateClinic(id: number, clinic: Clinic): Observable<Clinic> {
    const formData = new FormData();
    
    if (clinic.uploadImg) 
      formData.append('file', clinic.uploadImg);
    if(clinic.name)
      formData.append('name', clinic.name.trim());
    if(clinic.email)
      formData.append('email', clinic.email.trim());
    if(clinic.phone)
      formData.append('phone', clinic.phone.trim());
    if(clinic.address)
      formData.append('address', clinic.address.trim());

    console.log('Updating clinic with id:', id, 'Data:', clinic);

    return this.httpClient.patch<Clinic>(`${this.API_URL}/${id}`, formData).pipe(
      tap((apiResponse) => {
        console.log('Update response:', apiResponse);
        const current = this.dataChange.value;
        const idx = current.findIndex((c) => c.id === id);
        
        if (idx > -1) {
          const updatedClinic = { ...apiResponse };
          if(clinic.uploadImg && apiResponse.imageDir) {
            updatedClinic.imageDir += `?t=${Date.now()}`;
          }
          const updatedData = [...current];
          updatedData[idx] = updatedClinic;
          this.dataChange.next(updatedData);
        } else {
          console.warn(`Clinic with id ${id} not found in dataChange`);
          this.getAllClinics();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update error:', error);
        return throwError(() => new Error(`Failed to update clinic: ${error.status} - ${error.message}`));
      })
    );
  }

  deleteClinic(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log(`Clinic with id ${id} deleted successfully.`);
        const currentData = this.dataChange.value;
        this.dataChange.next(currentData.filter(c => c.id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting clinic with id ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteMultipleClinics(ids: number[]): Observable<void> {
    return forkJoin(
      ids.map(id => this.deleteClinic(id))
    ).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error deleting multiple clinics:', error);
        return throwError(() => new Error('Failed to delete one or more clinics'));
      })
    );
  }

  getDataChangeObservable(): Observable<Clinic[]> {
    return this.dataChange.asObservable();
  }
}