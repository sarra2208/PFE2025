import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete/delete.component';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil, TableElement } from '@shared';
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
import { Clinic } from "./Clinic.model";
import { ClinicsService } from "./clinics.service";
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-clinics',
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
    RouterModule
  ],
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.scss']
})
export class ClinicsComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    "select",
    "id",
    "imageDir",
    "name",
    "address",
    "phone",
    "email",
    "actions"
  ];
  
  exampleDatabase?: ClinicsService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<Clinic>(true, []);
  index?: number;
  id?: number;
  clinic!: Clinic;
  

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public clinicsService: ClinicsService,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew() {
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        clinic: this.clinic,
        action: 'add',
      },
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh();
      }
    });
  }

  editCall(row: Clinic) {
    this.id = row.id;
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        clinics: row, 
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

  deleteItem(i: number, row: Clinic) {
    this.index = i;
    this.id = row.id;
    const tempDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      height: '250px',
      width: '300px',
      data: row,
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh();
        this.showNotification(
          'snackbar-danger',
          'Clinic deleted successfully!',
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
  
    this.subs.sink = this.clinicsService.deleteMultipleClinics(this.selection.selected.map(c => c.id!))
      .subscribe({
        next: () => {
         
          this.refresh();
          this.selection.clear();
          this.showNotification(
            'snackbar-danger',
            `${totalSelect} clinics deleted successfully!`,
            'bottom',
            'center'
          );
        },
        error: (error) => {
          console.error('Error deleting clinics:', error);
          this.showNotification(
            'snackbar-danger',
            'Error deleting clinics!',
            'bottom',
            'center'
          );
        }
      });
  }

  public loadData() {
    this.exampleDatabase = new ClinicsService(this.httpClient);
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
    const exportData: Partial<TableElement>[] = this.dataSource.filteredData.map(x => ({
      'ID': x.id,
      'Name': x.name,
      'Email': x.email,
      'Address': x.address,
      'Phone': x.phone
    }));

    TableExportUtil.exportToExcel(exportData, 'clinics_data');
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

export class ExampleDataSource extends DataSource<Clinic> {
  filterChange = new BehaviorSubject('');
  
  get filter(): string {
    return this.filterChange.value;
  }
  
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  
  filteredData: Clinic[] = [];
  renderedData: Clinic[] = [];

  constructor(
    public exampleDatabase: ClinicsService,
    public paginator: MatPaginator,
    public sort: MatSort
  ) {
    super();
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  connect(): Observable<Clinic[]> {
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    
    this.exampleDatabase.getAllClinics();
    
    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((clinic: Clinic) => {
            const searchStr = (
              clinic.name + 
              clinic.address + 
              clinic.phone + 
              clinic.email
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
          
        const sortedData = this.sortData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }

  disconnect() {}

  sortData(data: Clinic[]): Clinic[] {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'id': return compare(+a.id!, +b.id!, isAsc);
        case 'name': return compare(a.name, b.name, isAsc);
        case 'address': return compare(a.address, b.address, isAsc);
        case 'phone': return compare(a.phone, b.phone, isAsc);
        case 'email': return compare(a.email, b.email, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}