import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Role } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
    selector: 'app-locked',
    templateUrl: './locked.component.html',
    styleUrls: ['./locked.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        RouterLink,
    ],
})
export class LockedComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  userImg!: string;
  userFullName!: string;
  hide = true;
  profile;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private ks: KeycloakService,
    private cookieService: CookieService
  ) {}
  ngOnInit() {
    const profileString = this.cookieService.get('profile') ;
     this.profile = profileString ? JSON.parse(profileString) : null;
    this.authForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
    this.userImg = this.profile?.imageDir 
    if(this.profile.role===Role.CompanyAdmin)
      this.userFullName=this.profile.name || "clinic"
    else   
    this.userFullName =this.profile.firstName +' ' + this.profile.lastName || "user"
  }
  get f() {
    return this.authForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    
    if (this.authForm.invalid) {
      return;
    } else {
      const role = this.profile.role;
      if ( role === Role.CompanyAdmin) {
        this.router.navigate(['/admin/dashboard/main']);
      } else if (role === Role.Employee) {
        this.router.navigate(['/employee/dashboard']);
      } else if (role === Role.Client) {
        this.router.navigate(['/client/dashboard']);
      } else {
        this.router.navigate(['/authentication/page401']);
      }
    }
  }
}
