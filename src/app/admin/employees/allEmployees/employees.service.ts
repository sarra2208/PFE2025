import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Employees } from './employees.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { environment } from 'environments/environment.development';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';


@Injectable({
  providedIn: 'root',
})
export class EmployeesService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = `${environment.baseUrl}/staff`;
  isTblLoading = true;
  dataChange: BehaviorSubject<Employees[]> = new BehaviorSubject<Employees[]>([]);
  

  private _dialogData!: Employees;
  
  constructor(private httpClient: HttpClient,
    private ks: KeycloakService
  ) {
    super();
    this.getAllEmployeess();
  }

  get data(): Employees[] {
    return this.dataChange.value;
  }

  set DialogData(employees: Employees) {
    this._dialogData = employees;
  }
  setDialogData(data: Employees): void {
    this._dialogData = data;
  }
  getDialogData(): Employees {
    return this._dialogData;
  }

  //-------crud
  updateEmployees(id: string, employee: Employees): Observable<Employees> {
    const formData = new FormData();
    console.table(employee)
    if (employee.uploadImg) 
      formData.append('file', employee.uploadImg);
    if (employee.firstName)
      formData.append('firstName', employee.firstName);
    if (employee.lastName)
      formData.append('lastName', employee.lastName);
    if (employee.cin)
      formData.append('cin', employee.cin);
    if (employee.grade)
      formData.append('grade', employee.grade);
    if (employee.email)
      formData.append('email', employee.email);
    if (employee.phone)
      formData.append('phone', employee.phone);
    if (employee.address)
      formData.append('address', employee.address);
    if (employee.hireDate)
      formData.append('hireDate', employee.hireDate);
    if (employee.speciality)
      formData.append('speciality', employee.speciality);
  

    return this.httpClient.patch<Employees>(`${this.API_URL}/${id}`, formData,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((apiResponse) => {
        console.log('Update response:', apiResponse); 
        const current = this.dataChange.value;
        const idx = current.findIndex((e) => e.id === id); 
        
        console.log('Index found:', idx, 'Current data:', current); 
        if (idx > -1) {
          const updatedEmployee = new Employees(apiResponse);
          
          if(employee.uploadImg && apiResponse.imageDir){
            updatedEmployee.imageDir += `?t=${Date.now()}`;
      
          }
          const updatedData = [...current];
        updatedData[idx] = updatedEmployee;

        this.dataChange.next(updatedData);
          console.log('Updated dataChange:', this.dataChange.value); 
        } else {
          console.warn(`Employee with id ${id} not found in dataChange`); 
          this.getAllEmployeess();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update error:', error); 
        return throwError(() => new Error(`Failed to update employee: ${error.status} - ${error.message}`));
      })
    );
  }

  deleteEmployees(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap(() => {
        console.log(`Employee with id ${id} deleted successfully.`); 
        const currentData = this.dataChange.value;
        this.dataChange.next(currentData.filter(emp => emp.id !== id));
        console.log('Updated dataChange after delete:', this.dataChange.value); 
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting employee with id ${id}:`, error); 
        return throwError(() => error);
      })
    );
  }

  addEmployees(employee: Employees): Observable<Employees> {
    const formData: FormData = new FormData();
    
    if (employee.uploadImg) {
      formData.append('file', employee.uploadImg as File);
    }
    
    formData.append('firstName', employee.firstName);
    formData.append('lastName', employee.lastName);
    formData.append('cin', employee.cin);
    formData.append('email', employee.email);
    formData.append('phone', employee.phone);
    formData.append('address', employee.address);
    formData.append('grade', employee.grade);
    formData.append('hireDate', employee.hireDate); 
    if (employee.speciality && employee.speciality === 'Doctor') {
      formData.append('speciality', employee.speciality);
    }

    return this.httpClient.post<Employees>(`${this.API_URL}/addStaff`, formData,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).pipe(
      tap((newEmployee: Employees) => {
        const currentData = this.dataChange.value;
        this.dataChange.next([...currentData, newEmployee])

      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Add error:', error);
        return throwError(() => new Error(`Failed to add employee: ${error.status} - ${error.message}`));
      })
    );
}

  getAllEmployeess(): void {
    this.isTblLoading = true;
    this.subs.sink = this.httpClient.get<Employees[]>(this.API_URL,
      { headers: {  Authorization: `Bearer ${this.ks.getToken()}` } }
    ).subscribe({
      next: (data) => {
        this.isTblLoading = false; 
        console.log('Fetched employees:', data); 
        this.dataChange.next(data);

        console.log('dataChange updated:', this.dataChange.value); 
      },
      error: (error: HttpErrorResponse) => {
        this.isTblLoading = false;
        console.error('Error fetching employees:', error); 
        this.dataChange.next([]);
      },
    });
  }

 
  getDataChangeObservable(): Observable<Employees[]> {
    return this.dataChange.asObservable();
  }
}