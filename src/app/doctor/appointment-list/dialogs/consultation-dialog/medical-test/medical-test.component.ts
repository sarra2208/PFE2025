import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { HttpClient } from '@angular/common/http';
import { MedicalTest } from '../model/medicalTest.model'; 
import { ConsultationService } from '../consultation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medical-test',
  templateUrl: './medical-test.component.html',
  standalone:true,
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
export class MedicalTestComponent  {
  @ViewChild('sidenav') sidenav!: MatSidenav;
   prescriptionId!: string | null;
  mode = new UntypedFormControl('side');
  testForm: UntypedFormGroup;
  isNewEvent = false;
  dialogTitle?: string;
 public tests: MedicalTest[] = [];
  isOpen = false;

  constructor(private fb: UntypedFormBuilder, private http: HttpClient, private consultationService: ConsultationService) {
    this.testForm = this.createFormGroup(new MedicalTest());
   // this.loadTests();
  }


  private loadTests() {
    // this.http.get<MedicalTest[]>('assets/data/medical-tests.json').subscribe({
    //   next: data => this.tests = data,
    //   error: err => console.error('Failed to load tests', err)
    // });
  }

  addNewTest() {
    this.resetFormField();
    this.isNewEvent = true;
    this.dialogTitle = 'New Medical Test';
    this.sidenav.open();
    this.isOpen = true;
  }

  testClick(test: MedicalTest) {
    this.isNewEvent = false;
    this.dialogTitle = 'Edit Medical Test';
    this.testForm = this.createFormGroup(test);
    this.sidenav.open();
    this.isOpen = true;
  }

  closeSlider() {
    this.sidenav.close();
    this.isOpen = false;
  }

  createFormGroup(data: MedicalTest) {
    return this.fb.group({
      id: [data.id || this.getRandomID()],
      type: [data.type],
 
    });
  }

 saveTest() {
  //const  sub = 
  this.consultationService.currentPrescriptionId.subscribe(id => {
    this.prescriptionId = id; })
    const newTest = new MedicalTest(this.testForm.value);
    newTest.prescriptionId =  this.prescriptionId!;
    this.consultationService.saveMedicalTest(newTest).subscribe({
      next: data => newTest.id = data.id
    });
    this.tests.unshift(newTest);
    this.closeSlider();
    this.resetFormField();
   // sub.unsubscribe()
  }

  editTest() {
    const updatedData = this.testForm.value;
    const index = this.tests.findIndex(t => t.id === updatedData.id);
    if (index !== -1) {
      this.tests[index] = updatedData;
    }
    this.closeSlider();
  }

  deleteTest() {
    const id = this.testForm.value.id;
    this.tests = this.tests.filter(t => t.id !== id);
    this.closeSlider();
  }

  resetFormField() {
    this.testForm.reset();
  }

  private getRandomID(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  log() {
    if (this.prescriptionId)
      this.consultationService.getMedicalTests(this.prescriptionId).subscribe(data => console.log(data));
  }
}
