import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { EmployeesService } from '../../employees.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

export interface DialogData {
  id: string;
  firstName: string;
  cin: string;
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
  private subList:Subscription[]=[];
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public employeesService: EmployeesService
  ) {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  confirmDelete(): void {
   const sub= this.employeesService.deleteEmployees(this.data.id).subscribe({
      next: () => {
        console.log('Employee deleted successfully');
       
      } ,
      error: (error) => {
        console.error('Error deleting employee:', error);
      }
    });
    this.subList.push(sub)
    
  }
  ngOnDestroy() {
    this.subList.forEach(sub => sub.unsubscribe());
  }
}
