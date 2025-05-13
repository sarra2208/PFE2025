import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { ServiceStaffService } from '../../service-staff.service';
import { ServiceStaff } from '../../service-staff.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface DialogData {
  action: string;
  serviceStaff: ServiceStaff;
}

@Component({
  selector: 'app-form-dialog',
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
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
   
  ],
})
export class FormDialogComponent implements OnInit {
  action: string;
  dialogTitle: string;
  serviceStaffForm: UntypedFormGroup;
  serviceStaff: ServiceStaff;

  statusOptions = ['Active', 'Inactive', 'Pending'];
  staffNames: Array<[string,string]> = [];
  ServicesNames: Array<{name: string, id: string}> = [];

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public serviceStaffService: ServiceStaffService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.serviceStaff = data.serviceStaff;
    this.dialogTitle = this.action === 'edit' ? `Edit Assignment ${data.serviceStaff.id}` : 'New Assignment';
    this.serviceStaffForm = this.createForm();
  }

  ngOnInit() {
    this.serviceStaffService.getStaffNames().subscribe((data) => {
      this.staffNames = data;
    });
    this.serviceStaffService.getServiceNames().subscribe((data) => {
      this.ServicesNames = data;
    });
  }

  createForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.serviceStaff.id],
      serviceId: [this.serviceStaff.serviceId, Validators.required],
      staffId: [this.serviceStaff.staffId, Validators.required],
      shiftSchedule: [
        this.serviceStaff.shiftSchedule,
        [
          Validators.required,
          Validators.pattern(/^((mon|tue|wed|thu|fri|sat|sun)-(mon|tue|wed|thu|fri|sat|sun) \d{1,2}:\d{2}-\d{1,2}:\d{2})(,(mon|tue|wed|thu|fri|sat|sun)-(mon|tue|wed|thu|fri|sat|sun) \d{1,2}:\d{2}-\d{1,2}:\d{2})*$/i)

        ],
      ],
      status: [this.serviceStaff.status, Validators.required],
    });
  }
  

  submit() {
    if (this.serviceStaffForm.valid) {
      this.confirmAdd();
    }
  }

  confirmAdd() {
    const formValue = this.serviceStaffForm.getRawValue();
    const serviceStaff: ServiceStaff = {
      ...formValue
    };

    if (this.action === 'edit') {
      this.serviceStaffService.updateServiceStaff(formValue.id, serviceStaff).subscribe({
        next: () => {
          this.snackBar.open('Assignment updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          this.dialogRef.close(1);
        },
        error: (error) => {
          this.snackBar.open(`Failed to update assignment: ${error.message}`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-danger'],
          });
        },
      });
    } else {
      this.serviceStaffService.createServiceStaff(serviceStaff).subscribe({
        next: () => {
          this.snackBar.open('Assignment created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          this.dialogRef.close(1);
        },
        error: (error) => {
          this.snackBar.open(`Failed to create assignment: ${error.message}`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-danger'],
          });
        },
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}