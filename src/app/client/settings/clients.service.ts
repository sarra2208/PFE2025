import { Injectable } from '@angular/core';
import { catchError, Observable,  throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment.development';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import {Clients} from './clients.model'
import { CookieService } from 'ngx-cookie-service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ClientsService  {
  private readonly API_URL = `${environment.baseUrl}/patients`;
    constructor(private httpClient: HttpClient,
    private ks: KeycloakService,
    private cookieService: CookieService
  ) {}
  addClient(client: Clients): Observable<Clients> {
  const formData: FormData = new FormData();


  if (client.uploadImg) formData.append('file', client.uploadImg as File);
  formData.append('firstName', client.firstName);
  formData.append('lastName', client.lastName);
  formData.append('email', client.email);
  formData.append('mobile', client.mobile);
  if(client.birthdate) formData.append('birthdate', formatDate(client.birthdate, 'yyyy-MM-dd', 'en') ); 
  formData.append('gender', client.gender);
  formData.append('blobGroup', client.blobGroup || '');
  formData.append('insuranceID', client.insuranceID || '');
  if(client.height) formData.append('height', client.height.toString());
  if(client.weight)formData.append('weight', client.weight.toString() );

  return this.httpClient.post<Clients>(`${this.API_URL}`, formData, {
    headers: {
      Authorization: `Bearer ${this.ks.getToken()}`
    }
  }).pipe(
    
    catchError((error: HttpErrorResponse) => {
      console.error('Add client error:', error);
      return throwError(() => new Error(`Failed to add client: ${error.status} - ${error.message}`));
    })
    
  )
}

}