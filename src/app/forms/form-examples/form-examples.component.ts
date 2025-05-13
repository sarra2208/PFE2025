import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Clinic } from 'app/admin/clinics/Clinic.model';
import { ClinicsService } from 'app/admin/clinics/clinics.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
@Component({
  selector: 'app-form-examples',
  templateUrl: './form-examples.component.html',
  styleUrls: ['./form-examples.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    FileUploadComponent
  ],
})
export class FormExamplesComponent {
  
  clinicsForm: UntypedFormGroup;
  clinics:Clinic=new Clinic();
   constructor(
    private clinicsService: ClinicsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar){
    this.clinicsForm = this.fb.group({
      imageDir: [this.clinics.imageDir],
      name: [this.clinics.name, Validators.required],
      address: [this.clinics.address, Validators.required],
      email: [this.clinics.email, [Validators.required, Validators.email]],
      uploadImg: [this.clinics.uploadImg],
      phone: [this.clinics.phone, [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
    });
   }
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
  
  
  submit(){}
  readonly imageByDefault = 'assets/images/user/clinic.png';
  
}
