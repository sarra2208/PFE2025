import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject,  } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import {  MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface DialogData {
  name: string;
  id: string;
}

@Component({
    selector: 'app-view:not(c)',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
        MatIconModule,
        CommonModule
    ],
})
export class ViewDialogComponent  {
  constructor(
    public dialogRef: MatDialogRef<ViewDialogComponent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public data: { appointment: any },
    private router: Router
  ) {}

  goToUserProfile(): void {
    const url = this.router.createUrlTree(['/users', this.data.appointment.patientId]).toString();
    window.open(url, '_blank');
  }

  goToHistory(): void {
    const url = this.router.createUrlTree(['/users', this.data.appointment.patientId]).toString();
    window.open(url, '_blank');
  }
  getStatusBadgeClass(status: string): string {
    console.log("1111111111& ",status?.toLowerCase())
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'badge badge-pill badge-primary  text-dark-yellow ';
      case 'confirmed':
        return 'badge badge-pill badge-primary col-green';
      case 'inactive':
        return 'badge badge-pill badge-primary col-blue ';
      default:
        return 'badge badge-pill badge-primary col-red';
    }
  }

}