import { Injectable, OnDestroy } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from 'environments/environment.development';
import { Role } from '@core/models/role';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Subscription, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService  implements OnDestroy{
  private _keycloak: Keycloak | undefined;
  

  constructor(private router: Router,private httpClient: HttpClient,private cookieService: CookieService) {}
private subList: Subscription[] = [];
  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: environment.Keycloak.url,
        realm: environment.Keycloak.realm,
        clientId: environment.Keycloak.clientId
      });
    }
    return this._keycloak;
  }

 
 public getToken(): string | undefined {
    return this.keycloak?.token;
  }

  async init(): Promise<void> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'login-required',
        redirectUri: window.location.href 
      });

      if (authenticated) {
        await this.loadUserProfile();
      //  this.router.navigate(['/']);
      }
    } catch (error) {
      //console.error('Keycloak initialization error:', error);
      this.router.navigate(['/error']);
    }
  }

   loadUserProfile(): void {
  
    console.log('token', this.keycloak.token);

  
    let role:string="";

    if (this.checkRole(Role.Doctor))  role = Role.Doctor;
    else if (this.checkRole(Role.Client))  role = Role.Client; 
    else if(this.checkRole(Role.Employee)) role = Role.Employee;
    else if(this.checkRole(Role.CompanyAdmin)) role = Role.CompanyAdmin;

    this.getProfile(role)
    
  }

  public getUserRoles(): string[] {
    const realmRoles = this.keycloak.tokenParsed?.realm_access?.roles || [];
    //const clientRoles = this.keycloak.tokenParsed?.resource_access?.[environment.Keycloak.clientId]?.roles || [];
    //return [...realmRoles, ...clientRoles];
    return realmRoles;
  }





 



  checkRole(role: Role): boolean {
    return this.getUserRoles().includes(role);
  }

  login(): Promise<void> {
    return this.keycloak.login();
  }

  logout(): Promise<void> {
    this.cookieService.delete('profile');
    return this.keycloak.logout({
      redirectUri: environment.apiUrl || 'http://localhost:4200'
    
    });
  }
  public update(){
    return this.keycloak?.accountManagement();

  }



  //profile:
  private readonly API_URL = `${environment.baseUrl}`;
    
   
    

    getProfile(role:string): void {
        const roleMap: Record<string, string> = {
          CompanyAdmin: "clinics",
          Doctor: "staff",
          Client: "patients",
      };
        const param: string = roleMap[role] ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const sub = this.httpClient.get<any>(`${this.API_URL}/${param}/me`,
          { headers: {  Authorization: `Bearer ${this.getToken()}` } }
        )
        .pipe( catchError(this.errorHandler))
        .subscribe( (data ) => { 
          
        if(data===null){
        this.cookieService.set('profile', JSON.stringify(role));
        if(Role.Client === role) {this.router.navigate(['/client/settings']);}
       }
      
       else {
        const dataWithRole = { ...data, role };
            this.cookieService.set('profile', JSON.stringify(dataWithRole));
            //this.router.navigate(['/'])
          
       }
      },

        
        )
         this.subList.push(sub);
        
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

   ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}