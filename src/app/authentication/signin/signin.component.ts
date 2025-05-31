import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { Role } from '@core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PreloadersComponent } from "../../ui/preloaders/preloaders.component";
import { PageLoaderComponent } from "../../layout/page-loader/page-loader.component";
import { CookieService } from 'ngx-cookie-service';
@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    standalone: true,
    imports: [
    RouterLink,
    MatProgressSpinnerModule,
    PreloadersComponent,
    PageLoaderComponent
],
})
export class SigninComponent  implements OnInit
{
  isLoading = false;
  profile;

  constructor(private ks: KeycloakService,private router: Router,private cookieService: CookieService) {}
  ngOnInit(): void {
    console.log("hello from signng company ");
  
      /*const profileString = this.cookieService.get('profile') ;
     this.profile = profileString ? JSON.parse(profileString) : null;
    switch (this.profile?.role) {
      case Role.CompanyAdmin:
        this.router.navigate(['/admin/dashboard/main']);
        break;  
      case Role.Client:
        this.router.navigate(['/client/dashboard']);
        break;
      case Role.Employee:
        this.router.navigate(['/employee/dashboard']);
        break;
      default:
        this.router.navigate(['/authentication/page401']);
        break;    
      }*/
              this.router.navigate(['/admin/dashboard/main']);


  }
  private navigateBasedOnRoles(): void {
   
    
  }
  }
