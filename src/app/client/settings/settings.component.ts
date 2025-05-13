import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ClientsService } from './clients.service';
import { Clients } from './clients.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    FileUploadComponent,
    CommonModule,
    ReactiveFormsModule
  ],
})
export class SettingsComponent implements OnInit {
  patientForm: UntypedFormGroup;
  profile;
  constructor(
    private ks: KeycloakService,
    private fb: UntypedFormBuilder,
    private cookieService: CookieService,
    private clientService:ClientsService
  ) {
    const profileString = this.cookieService.get('profile') ;
     this.profile = profileString ? JSON.parse(profileString) : null;

      this.patientForm = this.fb.group({
        firstName: [this.profile?.firstName],
        lastName: [this.profile?.lastName],
        birthdate: [this.profile?.birthdate],
        gender: [this.profile?.gender],
        mobile: [this.profile?.mobile, [Validators.pattern(/^(\+?[0-9]{8,15})$/)]],
        email: [this.profile?.email, [Validators.email]],
        blobGroup: [this.profile?.blobGroup],
        height: [this.profile?.height],
        weight: [this.profile?.weight],
        insuranceID: [this.profile?.insuranceID],
        uploadImg: [null]
      });

  }
  
  ngOnInit(): void {

   console.log()
  }
  save(){
     const newPatient = new Clients(this.patientForm.value);
  this.clientService.addClient(newPatient).subscribe(data=>{
     const profileString = this.cookieService.get('profile') ;
     const profileRole = profileString ? JSON.parse(profileString) : null;
    const dataWithRole = { ...data, role: profileRole?.role };
      this.cookieService.set('profile', JSON.stringify(dataWithRole));
  })
  }


  securitySettings(){
this.ks.update();
  }


  }

