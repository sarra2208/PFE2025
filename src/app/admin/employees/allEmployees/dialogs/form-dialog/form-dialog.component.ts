import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { EmployeesService } from '../../employees.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Employees } from '../../employees.model';
import { formatDate } from '@angular/common';
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
  employees: Employees;
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
export class FormDialogComponent implements OnInit,OnDestroy {
  action: string;
  dialogTitle: string;
  employeesForm: UntypedFormGroup;
  employees: Employees;
  private subList:Subscription[]=[];

  readonly imageByDefault = 'assets/images/user/employee.png';
  gradeOptions = [
    'Doctor', 'Nurse', 'Head Nurse', 'Medical Assistant', 
    'Surgeon', 'Specialist Doctor', 'Resident Doctor', 'Intern',
    'Radiologist', 'Anesthesiologist', 'Laboratory Technician',
    'Pharmacist', 'Receptionist', 'Administrative Staff',
    'Medical Secretary', 'IT Specialist', 'Maintenance Staff',
    'Security Personnel', 'Other'
  ];
  specialityOptions = [
    'Dentist','General Practitioner','Cardiologist','Dermatologist',
    'Endocrinologist','Gastroenterologist','Neurologist','Oncologist',
    'Ophthalmologist','Orthopedic Surgeon','Pediatrician','Psychiatrist',
    'Pulmonologist','Radiologist','Rheumatologist','Urologist','Anesthesiologist',
    'Gynecologist/Obstetrician', 'Nephrologist','Hematologist',
     'Infectious Disease Specialist','Other'
  ];
  employeesCopy: Partial<Employees> = {};

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public employeesService: EmployeesService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = `${data.employees.firstName} ${data.employees.lastName}`;
      this.employees = data.employees;
    } else {
      this.dialogTitle = 'New Employee';
      this.employees = new Employees({} as Employees);
    }
    this.employeesForm = this.createContactForm();
  }

  formControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  getErrorMessage(controlName: string): string {
    const control = this.employeesForm.get(controlName);
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
    this.employeesCopy = { ...this.employeesForm.getRawValue() };
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.employees.id],
      imageDir: [this.employees.imageDir],
      firstName: [this.employees.firstName, Validators.required],
      lastName: [this.employees.lastName, Validators.required],
      email: [this.employees.email, [Validators.required, Validators.email]],
      hireDate: [
        this.employees.hireDate ? formatDate(this.employees.hireDate, 'yyyy-MM-dd', 'en') : '',
        Validators.required
      ],
      grade: [this.employees.grade],
      cin: [this.employees.cin, [Validators.required]],
      phone: [this.employees.phone, [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      address: [this.employees.address, Validators.required],
      uploadImg: [this.employees.uploadImg],
      speciality: [this.employees.speciality],
    });
  }
  get isDoctorSelected(): boolean {
    return this.employeesForm.get('grade')?.value === 'Doctor';
  }
  submit() {
    if (this.employeesForm.valid) {
      this.confirmAdd();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  private showSnackbar(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  readonly maxSizeInMB = 5;
readonly maxSizeInOct = this.maxSizeInMB * 1024 * 1024;
imageFile: File | null = null;
imgError:boolean=false ;
onChangeImg() {
  const formValue = this.employeesForm.getRawValue();
  this.imageFile = formValue.uploadImg; 
  if (this.imageFile && this.imageFile.size > this.maxSizeInOct) {
    this.employeesForm.get('uploadImg')?.setValue(null);
    this.imageFile = null;
    this.imgError =true
  }
  else{
    this.imgError =false
  }
}

  public confirmAdd(): void {
    if (this.employeesForm.invalid) {
      return;
    }
  
    const formValue = this.employeesForm.getRawValue();
    const id: string = formValue.id;
    const successMessage = this.action === 'edit' ? 'Employee updated successfully!' : 'Employee created successfully!';
    const errorMessage = this.action === 'edit' ? 'Failed to update employee!' : 'Failed to create employee!';
    
    if (this.action === 'edit') {
      const differences = this.getObjectDifferences(this.employeesCopy, formValue);
      if (Object.keys(differences).length > 0) {
        const sub = this.employeesService.updateEmployees(id, differences as Employees).subscribe({
          next: (newEmployee: Employees) => {
            this.snackBar.open(successMessage, 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
            });
            const currentData = this.employeesService.dataChange.value;
            const idx = currentData.findIndex(e => e.id === id);
            if (idx > -1) {
              const updatedData = [...currentData];
              updatedData[idx] = newEmployee;
              this.employeesService.dataChange.next(updatedData);
            } else {
              console.warn('Employee not found in dataChange after update, reloading list...');
              this.employeesService.getAllEmployeess();
            }
    
            this.dialogRef.close(1);
          },
          error: (error) => {
            this.snackBar.open(errorMessage + ' ' + (error.message || 'Unknown error'), 'Close', {
              duration: 3000,
              panelClass: ['snackbar-danger'],
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
            });
            this.dialogRef.close(0);
          },
        });
        this.subList.push(sub);
      } else {
        this.snackBar.open('No changes detected.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-info'],
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
        this.dialogRef.close(); 
      }
    } else {
      const sub = this.employeesService.addEmployees(formValue as Employees).subscribe({
        next: (data: Employees) => {
          console.log(data);
          this.snackBar.open(successMessage, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.employeesService.setDialogData(data);
          this.dialogRef.close(1); 
        },
        error: (error) => {
          this.snackBar.open(errorMessage + ' ' + (error.message || 'Unknown error'), 'Close', {
            duration: 3000,
            panelClass: ['snackbar-danger'],
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
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

  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}