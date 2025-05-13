import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { PrescriptionDetail } from '../model/prescriptionDetail.model';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Prescription } from '../model/prescription.model';
import { ConsultationService } from '../consultation.service';

@Component({
  selector: 'app-prescription-detail',
  templateUrl: './prescription-detail.component.html',
  styleUrls: ['./prescription-detail.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule
   
  ],
})
export class PrescriptionDetailComponent  {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  mode = new UntypedFormControl('side');
  prescriptionForm: UntypedFormGroup;
  isNewEvent = false;
  dialogTitle?: string;
  prescriptions: PrescriptionDetail[] = [];
  isOpen:boolean=false;
  prescriptionId:string|null=null;

  constructor(private fb: UntypedFormBuilder, private http: HttpClient, private consultationService: ConsultationService) {
    this.prescriptionForm = this.createFormGroup(new PrescriptionDetail());
    this.loadPrescriptions();
  }

  private loadPrescriptions() {
    // this.http.get<PrescriptionDetail[]>('assets/data/prescription.json').subscribe({
    //   next: (data) => this.prescriptions = data,
    //   error: (err) => console.error('Failed to load prescriptions', err)
    // });
  }

  addNewPrescription() {
    this.resetFormField();
    this.isNewEvent = true;
    this.dialogTitle = 'New ';
    this.sidenav.open();
    this.isOpen=true
  }

  prescriptionClick(prescription: PrescriptionDetail) {
    this.isNewEvent = false;
    this.dialogTitle = 'Edit ';
    this.prescriptionForm = this.createFormGroup(prescription);
    this.sidenav.open();
    this.isOpen=true
  }

  closeSlider() {
    
    this.sidenav.close();
    this.isOpen=false
  }

  createFormGroup(data: PrescriptionDetail) {
    return this.fb.group({
      id: [data.id || this.getRandomID()],
      dosage: [data.dosage],
      frequency: [data.frequency],
      duration: [data.duration],
      name:[data.name],
      packages:[data.packages]
    });
  }

  savePrescriptionDtail() {
    const newPrescriptionDetail = new PrescriptionDetail(this.prescriptionForm.value);
    newPrescriptionDetail.prescriptionId=this.prescriptionId!;
    this.consultationService.savePrescriptionDetail(newPrescriptionDetail).subscribe({
      next:(data)=>{
        newPrescriptionDetail.id=data.id;
      }
    }
    )
    this.prescriptions.unshift(newPrescriptionDetail);
    this.sidenav.close();
    this.isOpen=false
    this.resetFormField();
  }

  editPrescription() {
    const updatedData = this.prescriptionForm.value;
    const index = this.prescriptions.findIndex(p => p.id === updatedData.id);
    if (index !== -1) {
      this.prescriptions[index] = updatedData;
    }
    this.sidenav.close();
    this.isOpen=false
  }

  deletePrescription() {
    const id = this.prescriptionForm.value.id;
    this.prescriptions = this.prescriptions.filter(p => p.id !== id);
    this.sidenav.close();
    this.isOpen=false
  }

  resetFormField() {
    this.prescriptionForm.reset();
  }

  private getRandomID(): string {
    return Math.random().toString(36).substring(2, 9);
  }



  savePrescription(consultationId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.prescriptionId === null) {
        const prescription = new Prescription();
        prescription.consultationId = consultationId;
        this.consultationService.savePrescription(prescription).subscribe({
          next: data => {
            this.prescriptionId = data.id!;
            this.consultationService.changePrescriptionId(this.prescriptionId); 
            resolve(this.prescriptionId);
          },
          error: err => reject(err)
        });
      } else {
        resolve(this.prescriptionId);
      }
    });
  }

  log(){
    if(this.prescriptionId)
    this.consultationService.getPrescriptionDetail(this.prescriptionId).subscribe(data=>console.log(data))

  }
  
}


