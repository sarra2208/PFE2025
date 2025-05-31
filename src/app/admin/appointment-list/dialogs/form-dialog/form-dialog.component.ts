import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AppointmentsService } from '../../appointments.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { Appointment } from '../../appointment.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
//import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
export interface DialogData {
  id: string;
  action: string;
  appointment: Appointment;
}

@Component({
  selector: 'app-form-dialog:not(c)',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    MatSnackBarModule,
   // OwlDateTimeModule ,
    //OwlNativeDateTimeModule   
  ],
})
export class FormDialogComponent implements OnInit, OnDestroy {
  action: string;
  dialogTitle: string;
  appointmentForm: UntypedFormGroup;
  appointment: Appointment;
  appointmentCopy: Partial<Appointment> = {};
  private subList: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public appointmentsService: AppointmentsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    
    if (this.action === 'edit') {
      this.dialogTitle = `Edit Appointment`;
      this.appointment = data.appointment;
    } else {
      this.dialogTitle = 'New Appointment';
      this.appointment = new Appointment();
    }
    this.appointmentForm = this.createContactForm();
  }

  formControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  getErrorMessage(controlName: string): string {
    const control = this.appointmentForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }

  ngOnInit() {
    this.appointmentCopy = { ...this.appointmentForm.getRawValue() };
  }
  statusList: string[] = ['Pending','Canceled','Confirmed'];

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.appointment.id],
      serviceStaffId: [this.appointment.serviceStaffId, Validators.required],
      patientId: [this.appointment.patientId, Validators.required],
      description: [this.appointment.description, Validators.required],
      type: [this.appointment.type, Validators.required],
      status: [this.appointment.status, Validators.required],
      date: [this.appointment.date, Validators.required],
      startDate: [this.appointment.startDate || new Date(), Validators.required],
      endDate: [this.appointment.endDate || new Date(), this.validateStartEndDates ],
      
    });
  }
  validateStartEndDates(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && new Date(start) >= new Date(end) ? { invalidDates: true } : null;
  }
  
  submit() {
    if (this.appointmentForm.valid) {
      this.confirmAdd();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    if (this.appointmentForm.invalid) {
      return;
    }

    const formValue = this.appointmentForm.getRawValue();
    const id: string = formValue.id;
    const successMessage = this.action === 'edit' ? 'Appointment updated successfully!' : 'Appointment created successfully!';
    const errorMessage = this.action === 'edit' ? 'Failed to update appointment!' : 'Failed to create appointment!';

    if (this.action === 'edit') {
      const differences = this.getObjectDifferences(this.appointmentCopy, formValue);
      if (Object.keys(differences).length > 0) {
        const sub = this.appointmentsService.updateAppointment(id, differences as Appointment)
          .subscribe({
            next: () => {
              this.showSnackbar(successMessage, 'success');
              this.appointmentsService.setDialogData(formValue);
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
      const sub = this.appointmentsService.addAppointment(formValue as Appointment)
        .subscribe({
          next: (data: Appointment) => {
            console.log(data)
            this.showSnackbar(successMessage, 'success');
            this.appointmentsService.setDialogData(formValue);
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

  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}