import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
//import { ViewDialogComponent } from './dialogs/view/view.component';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil } from '@shared';
import { NgClass, DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Appointment } from "./appointment.model";
import { AppointmentsService } from "./appointments.service";
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { ConsultationDialogComponent } from './dialogs/consultation-dialog/consultation-dialog.component';
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatCheckboxModule,
    FeatherIconsComponent,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    DatePipe,
    MatCheckboxModule,
  
    RouterModule
  ],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentsComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    "select",
    "datetime",
    "serviceStaffId",
    "patientId",
    "type",
    "description",
   // "status",
    'temporalStatus',
    "actions"
  ];
  
  exampleDatabase?: AppointmentsService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<Appointment>(true, []);
  index?: number;
  id?: string;
  appointment!: Appointment;
  filterByToday: boolean = false;

  


  
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public appointmentsService: AppointmentsService,
    private snackBar: MatSnackBar,
    private ks:KeycloakService
  ) {
    super();
  }

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }
  getStatusBadgeClass(status: string): string {
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


  editCall(row: Appointment) {
    this.id = row.id;
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        appointment: row, 
        action: 'edit',
      },
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh();
      }
    });
  }

  viewDetail(i: number, row: Appointment): void {
    this.index = i;
    this.id = row.id;
  
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
  
    const dialogRef = this.dialog.open(ConsultationDialogComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '80vw',
    //  panelClass: 'full-screen-dialog',
      data: {
        appointment: row
      },
      direction: tempDirection,
      disableClose: false,
      panelClass: 'custom-dialog-container' 
    });
  
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh();
        this.showNotification(
          'snackbar-danger',
          'Appointment deleted successfully!',
          'bottom',
          'center'
        );
      }
    });
  }
  

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach(row => this.selection.select(row));
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
  
    this.subs.sink = this.appointmentsService.deleteMultipleAppointments(this.selection.selected.map(a => a.id!))
      .subscribe({
        next: () => {
          this.refresh();
          this.selection.clear();
          this.showNotification(
            'snackbar-danger',
            `${totalSelect} appointments deleted successfully!`,
            'bottom',
            'center'
          );
        },
        error: (error) => {
          console.error('Error deleting appointments:', error);
          this.showNotification(
            'snackbar-danger',
            'Error deleting appointments!',
            'bottom',
            'center'
          );
        }
      });
  }

  public loadData() {
    this.exampleDatabase = new AppointmentsService(this.httpClient,this.ks);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
  

    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(() => {
      if (!this.dataSource) return;
      this.dataSource.filter = this.filter.nativeElement.value;
    });
  
  }
  exportExcel() {
    const exportData = this.dataSource.filteredData.map(x => ({
      'ID': x.id,
      'Service Staff ID': x.serviceStaffId,
      'Patient ID': x.patientId,
      'Description': x.description,
      'Type': x.type,
      'Status': x.status,
      'startDate': `${x.startDate}` || "",
      'endDate':`${x.endDate}` || ""
    }));

    TableExportUtil.exportToExcel(exportData, 'appointments_data');
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTemporalStatus(row: any): string {
    const now = new Date();
    const start = new Date(row.startDate);
    const end = new Date(row.endDate);
    const status = row.status?.toLowerCase();
  
    if (status === 'canceled') {
      return 'Cancelled';
    }
  
    if (now < start) {
      return 'Soon';
    } else if (now >= start && now <= end) {
      return 'En cours';
    } else if (now > end) {
      return 'Terminated';
    }
  
    return 'Unknown';
  }
  
  getTemporalStatusClass(status: string): string {
    switch (status) {
      case 'Soon':
        return 'badge badge-info';
      case 'En cours':
        return 'badge badge-warning';
      case 'Terminated':
        return 'badge badge-success';
      case 'Cancelled':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consultation(row: any): void {
    
    console.log('Consultation for appointment:', row);
    
  }
  filterDay() {
    this.filterByToday = !this.filterByToday;
    this.dataSource.filter = this.filterByToday ? 'today' : '';  
  }
  
  
}

export class ExampleDataSource extends DataSource<Appointment> {
  filterChange = new BehaviorSubject('');
  
  get filter(): string {
    return this.filterChange.value;
  }
  
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  
  filteredData: Appointment[] = [];
  renderedData: Appointment[] = [];

  constructor(
    public exampleDatabase: AppointmentsService,
    public paginator: MatPaginator,
    public sort: MatSort
  ) {
    super();
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  connect(): Observable<Appointment[]> {
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    
    this.exampleDatabase.getAllAppointments();
    
    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((appointment: Appointment) => {
            const filterText = this.filter.toLowerCase();
          
            
            if (filterText === 'today') {
              const today = new Date();
              const appointmentDate = new Date(appointment.date);
              return (
                appointmentDate.getDate() === today.getDate() &&
                appointmentDate.getMonth() === today.getMonth() &&
                appointmentDate.getFullYear() === today.getFullYear()
              );
            }
          
            const searchStr = (
              appointment.serviceStaffId +
              appointment.patientId +
              appointment.description +
              appointment.type +
              appointment.status
            ).toLowerCase();
          
            return searchStr.includes(filterText);
          });
          
          
        const sortedData = this.sortData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  sortData(data: Appointment[]): Appointment[] {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'id': return compare(a.id!, b.id!, isAsc);
        case 'serviceStaffId': return compare(a.serviceStaffId, b.serviceStaffId, isAsc);
        case 'patientId': return compare(a.patientId, b.patientId, isAsc);
        case 'description': return compare(a.description, b.description, isAsc);
        case 'type': return compare(a.type, b.type, isAsc);
        case 'status': return compare(a.status, b.status, isAsc);
        case 'datetime': return compare(a.date.toString(), b.date.toString(), isAsc);
        default: return 0;
      }
    });
  }

 
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}