
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder,  FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { ConsultationFormComponent } from "./consultation-form/consultation-form.component";
import { PrescriptionDetailComponent } from './prescription-detail/prescription-detail.component';
import { MedicalTestComponent } from "./medical-test/medical-test.component";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FollowupAppointmentComponent } from './followup-appointment/followup-appointment.component';
import { DocumentDownloadComponent } from './document-download/document-download.component';
import { PrescriptionDetail } from './model/prescriptionDetail.model';
import { PdfGeneratorService } from '@shared/utils/pdf-generator.service';



@Component({
  selector: 'app-consultation-dialog',
  templateUrl: './consultation-dialog.component.html',
  styleUrls: ['./consultation-dialog.component.scss'],
  standalone:true,
    imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    ConsultationFormComponent,
    PrescriptionDetailComponent,
    MedicalTestComponent,
    MatCheckboxModule,
    FollowupAppointmentComponent,
    DocumentDownloadComponent
  
],

})
export class ConsultationDialogComponent{
    firstFormGroup = this._formBuilder.group({
        firstCtrl: ['', Validators.required],
      });
      secondFormGroup = this._formBuilder.group({
        
      })
      medicalTestVal=
      this._formBuilder.group({
     
      })
      isLinear = false;
      consultationId:string|null=null;
      prescriptionId:string|null=null;
    
     
      constructor(private _formBuilder: FormBuilder,
         public dialogRef: MatDialogRef<ConsultationDialogComponent>,
         private cdr: ChangeDetectorRef,
        private pdfGeneratorService:PdfGeneratorService,
         private router: Router,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            @Inject(MAT_DIALOG_DATA) public data: { appointment: any },
        
        
      ) {}


      @ViewChild('consultationForm') consultationFormComponent!: ConsultationFormComponent;
      @ViewChild('prescriptionForm') prescriptionFormComponent!: PrescriptionDetailComponent;
      @ViewChild('followupAppointment') followupAppointment!: FollowupAppointmentComponent;
      @ViewChild('medicalTestForm') medicalTest!:MedicalTestComponent;
    
      
      isFollowUp = true;

   async  saveConsultation() {

    try {
        this.consultationId = await this.consultationFormComponent.saveConsultation();
        this.prescriptionId = await this.prescriptionFormComponent.savePrescription(this.consultationId);
        this.cdr.detectChanges();
    }
    catch (error) {
      console.error("Error saving consultation :", error);
    }
      }


    


      goToUserProfile(): void {
        const url = this.router.createUrlTree(['/users', this.data.appointment.patientId]).toString();
        window.open(url, '_blank');
      }
    
      goToHistory(): void {
        const url = this.router.createUrlTree(['/users', this.data.appointment.patientId]).toString();
        window.open(url, '_blank');
      }   

      saveAppointment(){
        this.followupAppointment.saveAppointment();
      }


      generatePrescription(){
        
        this.medicalTest.tests;
        const doctorName= "Dr. Mohamed"
        const patientName= "Aymen"
        const consultationId= `${this.consultationId}`;
        const date= new Date()
        const prescriptions:PrescriptionDetail[] = this.prescriptionFormComponent.prescriptions
         this.pdfGeneratorService.generatePrescriptionPdf(doctorName,patientName,consultationId,date,prescriptions)
       
      }

    
  
  
}
