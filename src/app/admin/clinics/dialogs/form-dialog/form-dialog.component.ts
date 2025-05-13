import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ClinicsService } from '../../clinics.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Clinic } from '../../Clinic.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import {  MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface DialogData {
  id: number;
  action: string;
  clinics: Clinic; 
}

@Component({
  selector: 'app-form-dialog:not(c)',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogClose,
    MatOptionModule,
    MatSelectModule,
    FileUploadComponent,
    MatSnackBarModule    
  ],
})
export class FormDialogComponent implements OnInit, OnDestroy {
  action: string;
  dialogTitle: string;
  clinicsForm: UntypedFormGroup;
  clinics: Clinic;
  readonly imageByDefault = 'assets/images/user/clinic.png';
  clinicsCopy: Partial<Clinic> = {};
  private subList: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public clinicsService: ClinicsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    
    if (this.action === 'edit') {
      this.dialogTitle = `${data.clinics.name}`;
      this.clinics = data.clinics;
    } else {
      this.dialogTitle = 'New Clinic';
      this.clinics = new Clinic();
    }
    this.clinicsForm = this.createContactForm();
  }

  formControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  getErrorMessage(controlName: string): string {
    const control = this.clinicsForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Not a valid email';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid phone number format';
    }
    return '';
  }

  ngOnInit() {
    this.clinicsCopy = { ...this.clinicsForm.getRawValue() };
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.clinics.id],
      imageDir: [this.clinics.imageDir],
      name: [this.clinics.name, Validators.required],
      address: [this.clinics.address, Validators.required],
      email: [this.clinics.email, [Validators.required, Validators.email]],
      uploadImg: [this.clinics.uploadImg],
      phone: [this.clinics.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
    });
  }

  submit() {
    if (this.clinicsForm.valid) {
      this.confirmAdd();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    if (this.clinicsForm.invalid) {
      return;
    }

    const formValue = this.clinicsForm.getRawValue();
    const id: number = formValue.id;
    const successMessage = this.action === 'edit' ? 'Clinic updated successfully!' : 'Clinic created successfully!';
    const errorMessage = this.action === 'edit' ? 'Failed to update clinic!' : 'Failed to create clinic!';

    const imageFile: File = formValue.uploadImg; 
    const maxSizeInMB = 5;
    if (imageFile && imageFile.size > maxSizeInMB * 1024 * 1024) {
      this.showSnackbar(`Image too large (${(imageFile.size / (1024 * 1024)).toFixed(2)} MB). Maximum size: ${maxSizeInMB} MB.`, 'danger');
      this.dialogRef.close();
    }
    if (this.action === 'edit') {
      const differences = this.getObjectDifferences(this.clinicsCopy, formValue);
      if (Object.keys(differences).length > 0) {
        const sub = this.clinicsService.updateClinic(id, differences as Clinic)
          .subscribe({
            next: () => {
              this.showSnackbar(successMessage, 'success');
              this.clinicsService.setDialogData(formValue);
              this.dialogRef.close(1);
            },
            error: (error) => {
              this.showSnackbar(`${errorMessage} ${error.message}`, 'error');
              this.dialogRef.close(0);
            }
          });
          this.subList.push(sub);
      } else {
        this.showSnackbar('No changes detected.', 'info');
        this.dialogRef.close();
      }
    } else {
      const sub = this.clinicsService.addClinic(formValue as Clinic)
        .subscribe({
          next: (data: Clinic) => {
            console.log(data)
            this.showSnackbar(successMessage, 'success');
            this.clinicsService.setDialogData(formValue);
            this.dialogRef.close(1);
          },
          error: (error) => {
            this.showSnackbar(`${errorMessage} ${error.message}`, 'error');
            this.dialogRef.close(0);
          }
        });
        this.subList.push(sub);
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info' | 'danger') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  private getObjectDifferences<T extends object>(original: Partial<T>, updated: T): Partial<T> {
    return Object.keys(updated).reduce((acc, key) => {
      if (original[key as keyof T] !== updated[key as keyof T]) {
        acc[key as keyof T] = updated[key as keyof T];
      }
      return acc;
    }, {} as Partial<T>);
  }

  readonly maxSizeInMB = 5;
  readonly maxSizeInOct = this.maxSizeInMB * 1024 * 1024;
  imageFile: File | null = null;
  imgError:boolean=false ;
  onChangeImg() {
    const formValue = this.clinicsForm.getRawValue();
    this.imageFile = formValue.uploadImg; 
    if (this.imageFile && this.imageFile.size > this.maxSizeInOct) {
      this.clinicsForm.get('uploadImg')?.setValue(null);
      this.imageFile = null;
      this.imgError =true
    }
    else{
      this.imgError =false
    }
  }
  validatePhoneKey(event: KeyboardEvent) {
    const allowedChars = /[0-9+]/;
    const inputChar = event.key;
  
    if (!allowedChars.test(inputChar)) {
      event.preventDefault();
    }
  
    if (inputChar === '+' && (event.target as HTMLInputElement).value.includes('+')) {
      event.preventDefault();
    }
  }
  
  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}