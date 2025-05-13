import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ServiceStaff } from './service-staff.model';
import { DataSource } from '@angular/cdk/collections';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormDialogComponent } from './dialog/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './dialog/delete/delete.component'
import { SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil, TableElement } from '@shared';
import {  DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import {ServiceStaffService} from './service-staff.service'
import { KeycloakService } from '@core/service/keycloak/keycloak.service';

@Component({
  selector: 'app-service-staff',
  templateUrl: './service-staff.component.html',
  styleUrls: ['./service-staff.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    BreadcrumbComponent,
    FeatherIconsComponent,
    DatePipe
   
  ],
})
export class ServiceStaffComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns: string[] = [
    'select',
    'id',
    'serviceId',
    'staffId',
    'shiftSchedule',
    'status',
    'staff',
    'actions'
  ];
  exampleDatabase?: ServiceStaffService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<ServiceStaff>(true, []);
  id?: string;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public  serviceStaffService: ServiceStaffService,
    private snackBar: MatSnackBar,
    private ks: KeycloakService
  ) {
    super();
  }


  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;

  staffNames: Array<[string,string]> = [];
  ServicesNames: Array<{name: string, id: string}> = [];
  staffNameMap: Map<string, string> = new Map();
  serviceNameMap: Map<string, string> = new Map();
  ngOnInit() {
    this.loadData();
    this.serviceStaffService.getStaffNames().subscribe((data) => {
      this.staffNames = data;
      this.staffNameMap = new Map(data.map(([id, name]) => [id, name]));
    });
    this.serviceStaffService.getServiceNames().subscribe((data) => {
      this.ServicesNames = data;
      this.serviceNameMap = new Map(data.map(service => [service.id, service.name]));
    });
   
  }

  refresh() {
    this.loadData();
  }

  public getStaffNameById(staffId: string): string {
    return this.staffNameMap.get(staffId) || staffId;
  }
  
  public getServiceNameById(serviceId: string): string {
    return this.serviceNameMap.get(serviceId) || serviceId ;
  }

  addNew() {
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        serviceStaff: new ServiceStaff({} as ServiceStaff),
        action: 'add',
      },
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.exampleDatabase?.dataChange.value.unshift(this.serviceStaffService.getDialogData());
        this.refreshTable();
        this.showNotification('snackbar-success', 'Assignment Added Successfully!', 'bottom', 'center');
      }
    });
  }

  editCall(row: ServiceStaff) {
 
    this.id = row.id;
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        serviceStaff: row,
        action: 'edit',
      },
      direction: tempDirection,
    });
  
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh();
        this.showNotification('snackbar-success', 'Assignment Updated Successfully!', 'bottom', 'center');
      }
    });
  }

  deleteItem(id: string, row: ServiceStaff) {
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { id, serviceId: row.serviceId, staffId: row.staffId },
      direction: tempDirection,
    });
  
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.serviceStaffService.deleteServiceStaff(id).subscribe({
          next: () => {
            this.refresh(); 
            this.showNotification(
              'snackbar-success', 
              'Suppression réussie!',
              'bottom',
              'center'
            );
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.showNotification(
              'snackbar-error',
              'Échec de la suppression',
              'bottom',
              'center'
            );
          }
        });
      }
    });
  }
  private refreshTable() {
    if (this.paginator) {
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) => this.selection.select(row));
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    if (totalSelect > 0) {
      const ids = this.selection.selected.map(item => item.id!);
      this.serviceStaffService.deleteMultiple(ids).subscribe({
        next: () => {
          this.selection.clear();
          this.refreshTable();
          this.showNotification(
            'snackbar-success',
            `${totalSelect} Assignments Deleted Successfully!`,
            'bottom',
            'center'
          );
        },
        error: (error) => {
          console.error('Error deleting multiple assignments:', error);
          this.showNotification(
            'snackbar-error',
            'Failed to Delete Selected Assignments!',
            'bottom',
            'center'
          );
        }
      });
    }
  }
  public loadData() {
    this.exampleDatabase = new ServiceStaffService(this.httpClient,this.ks);
    this.dataSource = new ExampleDataSource(this.exampleDatabase, this.paginator, this.sort);
    this.subs.sink = fromEvent<Event>(this.filter.nativeElement, 'keyup').pipe(
      map((event) => (event.target as HTMLInputElement).value.trim())
    ).subscribe((value) => {
      if (!this.dataSource) return;
      this.dataSource.filter = value;
    });
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] = this.dataSource.filteredData.map((x) => ({
      'ID': x.id!,
      'Service ID': x.serviceId + ' - ' + this.getServiceNameById(x.serviceId),
      'Staff ID': x.staffId + ' - ' + this.getStaffNameById(x.staffId),
      'Shift Schedule': x.shiftSchedule ?? '',
      'Status': x.status,
    }));

    TableExportUtil.exportToExcel(exportData, 'service-staff');
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
}

export class ExampleDataSource extends DataSource<ServiceStaff> {
  filterChange = new BehaviorSubject('');
  filteredData: ServiceStaff[] = [];
  renderedData: ServiceStaff[] = [];

  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }

  constructor(
    public exampleDatabase: ServiceStaffService,
    public paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  connect(): Observable<ServiceStaff[]> {
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getAllServiceStaff();

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.exampleDatabase?.data?.slice().filter((item: ServiceStaff) => {
          const searchStr = (
            item.id +
            item.serviceId +
            item.staffId +
            item.status
          ).toLowerCase();
          return searchStr.includes(this.filter.toLowerCase());
        });

        const sortedData = this.sortData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  sortData(data: ServiceStaff[]): ServiceStaff[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string | Date = '';
      let propertyB: number | string | Date = '';

      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id ?? '', b.id ?? ''];
          break;
        case 'serviceId':
          [propertyA, propertyB] = [a.serviceId , b.serviceId];
          break;
        case 'staffId':
          [propertyA, propertyB] = [a.staffId, b.staffId];
          break;
        case 'shiftSchedule':
          [propertyA, propertyB] = [a.shiftSchedule , b.shiftSchedule ];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
          break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }

 
 
}
// interface ServiceStaff {
//   id: string;
//   serviceId: string;
//   staffId: string;
//   startDate: string;
//   endDate: string;
//   status: string;
// }

// interface GroupedServiceStaff {
//   serviceId: string;
//   staffIds: string[];
//   items: ServiceStaff[];
// }

// function groupByServiceId(data: ServiceStaff[]): GroupedServiceStaff[] {
//   const resultMap = new Map<string, GroupedServiceStaff>();

//   data.forEach(item => {
//     if (!resultMap.has(item.serviceId)) {
//       resultMap.set(item.serviceId, {
//         serviceId: item.serviceId,
//         staffIds: [],
//         items: []
//       });
//     }
    
//     const group = resultMap.get(item.serviceId)!;
//     if (!group.staffIds.includes(item.staffId)) {
//       group.staffIds.push(item.staffId);
//     }
//     group.items.push(item);
//   });

//   return Array.from(resultMap.values());
// }