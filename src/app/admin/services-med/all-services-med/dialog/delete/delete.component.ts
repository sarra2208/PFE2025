import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { ServiceService } from '../../../services-med.service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: string;
  name: string;
  role: string;
  clinicId: string;
}

@Component({
  selector: 'app-delete:not(d)',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    DatePipe,
  ],
})
export class DeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public serviceService: ServiceService
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.serviceService.deleteService(this.data.id).subscribe(
      () => {
        this.dialogRef.close(0);
      });
  }
}