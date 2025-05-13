import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CalendarService } from '../../calendar.service';
import { UntypedFormControl, Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from 'app/calendar/calendar.model';

export interface DialogData {
  action: string;
  appointment: Appointment;
}

@Component({
    selector: 'app-form-dialog:not(l)',
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
        MatSelectModule,
        MatOptionModule,
        OwlDateTimeModule,
    ],
})
export class FormDialogComponent {
  action: string;
  dialogTitle: string;
  appointmentForm: UntypedFormGroup;
  appointment: Appointment;
  showDeleteBtn = false;
  formControl = new UntypedFormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public calendarService: CalendarService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.appointment.description || 'Edit Appointment';
      this.appointment = data.appointment;
      this.showDeleteBtn = true;
    } else {
      this.dialogTitle = 'New Appointment';
      this.appointment = new Appointment({});
      this.showDeleteBtn = false;
    }

    this.appointmentForm = this.createContactForm();
  }

  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('pattern')
      ? 'Invalid input'
      : '';
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.appointment.id],
      description: [
        this.appointment.description,
        [Validators.required, Validators.pattern('[a-zA-Z]+([a-zA-Z ]+)*')],
      ],
      type: [this.appointment.type || 'Consultation', [Validators.required]],
      status: [this.appointment.status || 'Pending', [Validators.required]],
      patientId: [
        this.appointment.patientId,
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      serviceStaffId: [
        this.appointment.serviceStaffId,
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      startDate: [this.appointment.startDate, [Validators.required]],
      endDate: [this.appointment.endDate, [Validators.required]],
    });
  }

  submit() {
    // Empty method, using confirmAdd instead
  }

  deleteEvent() {
    this.calendarService.deleteCalendar(this.appointmentForm.getRawValue());
    this.dialogRef.close('delete');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    this.calendarService.addUpdateCalendar(this.appointmentForm.getRawValue());
    this.dialogRef.close('submit');
  }
}