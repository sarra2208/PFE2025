import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { AppointmentsService } from '../../appointments.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

export interface DialogData {
  name: string;
  id: string;
}

@Component({
    selector: 'app-delete:not(c)',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ],
})
export class DeleteDialogComponent implements OnDestroy {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public appointmentsService: AppointmentsService
  ) {}
   private subList: Subscription[] = [];
  onNoClick(): void {
    this.dialogRef.close();
  }
  confirmDelete(): void {
    const sub = this.appointmentsService.deleteAppointment(this.data.id).subscribe({
      next: () => {
        console.log('Appointment deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
      }
    });
    this.subList.push(sub);
  }
  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}