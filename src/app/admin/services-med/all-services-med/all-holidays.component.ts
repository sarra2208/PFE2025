
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ServiceService } from '../services-med.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ServiceMed } from '../ServiceMed.model';
import { DataSource } from '@angular/cdk/collections';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormDialogComponent } from './dialog/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './dialog/delete/delete.component';
import { SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil, TableElement } from '@shared';
import { NgClass, DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
@Component({
  selector: 'app-allservices',
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss'],
  standalone: true,
  imports: [
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
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    CommonModule,
    RouterModule,
    
  ],
})
export class AllservicesComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  displayedColumns = [
    'select',
    'img',
    'name',
    'description',
    'actions'
  ];
  readonly imageByDefault = 'assets/images/service/default-service.png';
  exampleDatabase?: ServiceService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<ServiceMed>(true, []);
  index?: number;
  id?: string;
  ServiceMed?: ServiceMed;
  clinicMap: Map<string, string> = new Map();
  clinics: {id: string, name: string}[] = [];
  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public serviceService: ServiceService,
    private snackBar: MatSnackBar,
    private ks : KeycloakService
  ) {
    super();
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
 

  ngOnInit() {
    // this.serviceService.getClinics().subscribe((clinics: {id: string, name: string}[]) => {
    //   this.clinics = clinics;
    //   this.clinicMap = new Map(clinics.map(clinic => [clinic.id, clinic.name]));
    // });
    this.loadData();
    
   
  }

  refresh() {
    this.loadData();
  }
  getClinicNameById(clinicId: string): string {
    return this.clinicMap.get(clinicId)  || clinicId ;
  }

  addNew() {
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        ServiceMed: this.ServiceMed,
        action: 'add',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.exampleDatabase?.dataChange.value.unshift(
          this.serviceService.getDialogData()
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-success',
          'Add Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }

  editCall(row: ServiceMed) {
    this.id = row.id;
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        ServiceMed: row,
        action: 'edit',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase?.dataChange.value.findIndex(
          (x) => x.id === this.id
        );
        if (foundIndex !== undefined && this.exampleDatabase !== undefined) {
          this.exampleDatabase.dataChange.value[foundIndex] = 
            this.serviceService.getDialogData();
          this.refreshTable();
          this.showNotification(
            'black',
            'Edit Record Successfully...!!!',
            'bottom',
            'center'
          );
        }
      }
    });
  }

  deleteItem(i: number, row: ServiceMed) {
    this.index = i;
    this.id = row.id;
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      height: '270px',
      width: '300px',
      data: row,
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase?.dataChange.value.findIndex(
          (x) => x.id === this.id
        );
        if (foundIndex !== undefined && this.exampleDatabase !== undefined) {
          this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
          this.refreshTable();
          this.showNotification(
            'snackbar-danger',
            'Delete Record Successfully...!!!',
            'bottom',
            'center'
          );
        }
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
      : this.dataSource.renderedData.forEach((row) =>
          this.selection.select(row)
        );
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    this.selection.selected.forEach((item) => {
      this.serviceService.deleteService(item.id).subscribe({
        next: () => {
          const index: number = this.dataSource.renderedData.findIndex(
            (d) => d === item
          );
          this.exampleDatabase?.dataChange.value.splice(index, 1);
        }
      });
      this.refreshTable();
      this.selection = new SelectionModel<ServiceMed>(true, []);
    });
    this.showNotification(
      'snackbar-danger',
      totalSelect + ' Record Delete Successfully...!!!',
      'bottom',
      'center'
    );
  }
  public loadData() {
    this.exampleDatabase = new ServiceService(this.httpClient,this.ks);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'ServiceMed Name': x.name,
        'Description': x.description
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
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

  onContextMenu(event: MouseEvent, item: ServiceMed) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}

export class ExampleDataSource extends DataSource<ServiceMed> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: ServiceMed[] = [];
  renderedData: ServiceMed[] = [];

  constructor(
    public exampleDatabase: ServiceService,
    public paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  connect(): Observable<ServiceMed[]> {
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getAllServices();
    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((ServiceMed: ServiceMed) => {
            const searchStr = (
              ServiceMed.name +
              ServiceMed.description 
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        const sortedData = this.sortData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  sortData(data: ServiceMed[]): ServiceMed[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break
        case 'description':
          [propertyA, propertyB] = [a.description, b.description];
          break;
      
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }

}

