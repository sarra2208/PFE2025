import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ServiceService } from '../../../services-med.service';
import {  Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceMed } from '../../../ServiceMed.model'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface DialogData {
  id: string;
  action: string;
  ServiceMed: ServiceMed;
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
  serviceForm: UntypedFormGroup;
  ServiceMed: ServiceMed;
  private subList: Subscription[] = [];

  readonly imageByDefault = 'assets/images/service/default-service.png';
    roleOptions = [
      'Medical Service',
      'Diagnostic Service',
      'Surgical Service',
      'Therapeutic Service',
      'Emergency Service',
      'Preventive Service',
      'Rehabilitation Service',
      'Consultation Service',
      'Other'
    ];

  serviceCopy: Partial<ServiceMed> = {};
  readonly maxSizeInMB = 5;
  readonly maxSizeInOct = this.maxSizeInMB * 1024 * 1024;
  imageFile: File | null = null;
  imgError: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public serviceService: ServiceService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.ServiceMed.name;
      this.ServiceMed = data.ServiceMed;
    } else {
      this.dialogTitle = 'New Service';
      this.ServiceMed = new ServiceMed({} as ServiceMed);
    }
    this.serviceForm = this.createServiceForm();
  }
  clinics: {id: string, name: string}[] = [];
  selectedClinic(){
    // this.serviceService.getClinics().subscribe((clinics: {id: string, name: string}[]) => {
    //   this.clinics = clinics;
    // })
  }
  ngOnInit() {
    this.serviceCopy = { ...this.serviceForm.getRawValue() };
    this.selectedClinic();
  }

  createServiceForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.ServiceMed.id],
      imageDir: [this.ServiceMed.imageDir],
      name: [this.ServiceMed.name, Validators.required],
      description: [this.ServiceMed.description],
      uploadImg: [this.ServiceMed.uploadImg]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.serviceForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }

  submit() {
    if (this.serviceForm.valid) {
      this.confirmAdd();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onChangeImg() {
    const formValue = this.serviceForm.getRawValue();
    this.imageFile = formValue.uploadImg;
    if (this.imageFile && this.imageFile.size > this.maxSizeInOct) {
      this.serviceForm.get('uploadImg')?.setValue(null);
      this.imageFile = null;
      this.imgError = true;
    } else {
      this.imgError = false;
    }
  }

  public confirmAdd(): void {
    if (this.serviceForm.invalid) {
      return;
    }

    const formValue = this.serviceForm.getRawValue();
    const id: string = formValue.id;
    const successMessage = this.action === 'edit' ? 'Service updated successfully!' : 'Service created successfully!';
    const errorMessage = this.action === 'edit' ? 'Failed to update service!' : 'Failed to create service!';

    if (this.action === 'edit') {
      const differences = this.getObjectDifferences(this.serviceCopy, formValue);
      if (Object.keys(differences).length > 0) {
        const sub = this.serviceService.updateService(id, differences as ServiceMed).subscribe({
          next: () => {
            this.showSnackbar(successMessage, 'success');
            this.serviceService.setDialogData(formValue);
            this.dialogRef.close(1);
          },
          error: (error) => {
            this.showSnackbar(errorMessage + ' ' + (error.message || 'Unknown error'), 'error');
            this.dialogRef.close(0);
          },
        });
        this.subList.push(sub);
      } else {
        this.showSnackbar('No changes detected.', 'info');
        this.dialogRef.close();
      }
    } else {
      const sub = this.serviceService.addService(formValue as ServiceMed).subscribe({
        next: () => {
          this.showSnackbar(successMessage, 'success');
          this.serviceService.setDialogData(formValue);
          this.dialogRef.close(1);
        },
        error: (error) => {
          this.showSnackbar(errorMessage + ' ' + (error.message || 'Unknown error'), 'error');
          this.dialogRef.close(0);
        },
      });
      this.subList.push(sub);
    }
  }

  private getObjectDifferences<T extends object>(original: Partial<T>, updated: T): Partial<T> {
    return Object.keys(updated).reduce((acc, key) => {
      if (original[key as keyof T] !== updated[key as keyof T]) {
        acc[key as keyof T] = updated[key as keyof T];
      }
      return acc;
    }, {} as Partial<T>);
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}