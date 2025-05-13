import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogContent, MatDialogClose],
})
export class DeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, serviceId: string, staffId: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  confirmDelete(): void {
    this.dialogRef.close(true);
  }
}