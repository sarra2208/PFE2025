import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EmployeesService } from './employees.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Employees } from './employees.model';
import { DataSource } from '@angular/cdk/collections';
import { CapitalizePipe } from '@shared/pipes/capitalize.pipe'
import { PhonePipe } from '@shared/pipes/phone.pipe';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete/delete.component';
import { SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil, TableElement } from '@shared';
import { formatDate, NgClass, DatePipe, CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';


@Component({
  selector: 'app-allemployees',
  templateUrl: './allemployees.component.html',
  styleUrls: ['./allemployees.component.scss'],
  standalone: true,

  imports: [
    PhonePipe ,
    CapitalizePipe,
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
    CommonModule
  ],
})
export class AllemployeesComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  displayedColumns = [
    'select',
    'img',
    'cin',
    'name',
    'grade',
    'phone',
    'hireDate',
    'email',
    'address',
    'actions',
  ];
 
  readonly imageByDefault = 'assets/images/user/employee.png';
  exampleDatabase?: EmployeesService;
  log():void{
    console.table(this.dataSource.exampleDatabase.data)
  }
  public dataSource!: ExampleDataSource;
  selection = new SelectionModel<Employees>(true, []);
  index?: string;
  id?: string;
  employees?: Employees;
  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public employeesService: EmployeesService,
    private snackBar: MatSnackBar,
    private ks: KeycloakService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };


  getGradeBadgeClass(grade: string): string {
    switch (grade?.toLowerCase()) {
      case 'doctor':
      case 'surgeon':
      case 'specialist doctor':
      case 'resident doctor':
        return 'badge bg-indigo text-white';
  
      case 'nurse':
      case 'head nurse':
        return 'badge bg-teal text-white';
  
      case 'medical assistant':
      case 'intern':
        return 'badge bg-cyan text-dark';
  
      case 'radiologist':
      case 'anesthesiologist':
      case 'laboratory technician':
      case 'pharmacist':
         return 'badge bg-warning text-dark'; 
  
      case 'receptionist':
      case 'administrative staff':
      case 'medical secretary':
        return 'badge bg-slate text-white';
  
      case 'it specialist':
        return 'badge bg-dark'; 
  
      case 'maintenance staff':
      case 'security personnel':
        return 'badge bg-zinc text-white';
  
      case 'other':
        return 'badge bg-light text-dark'; 
      default:
        return 'badge bg-light text-dark';
    }
  }

  

  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.loadData();
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
        employees: this.employees,
        action: 'add',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        const newEmployee = this.employeesService.getDialogData();
        this.exampleDatabase?.dataChange.next([
          ...this.exampleDatabase.dataChange.value,
          newEmployee
        ]);
   
        this.refreshTable();
        this.cdr.detectChanges(); 
        this.showNotification(
          'snackbar-success',
          'Add Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }

  editCall(row: Employees) {
    this.id = row.id;
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        employees: row,
        action: 'edit',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.refresh(); 
        const updatedEmployee = this.employeesService.getDialogData();
        if (updatedEmployee && this.exampleDatabase) {
          const currentData = this.exampleDatabase.dataChange.value;
          const idx = currentData.findIndex(e => e.id === updatedEmployee.id);
          if (idx > -1) {
            const updatedData = [...currentData];
            updatedData[idx] = updatedEmployee;
            this.exampleDatabase.dataChange.next(updatedData);
            this.refreshTable();
            this.cdr.detectChanges()
          } else {
            console.warn('Updated employee not found in table, maybe need reload?');
          }
        }
      }
    });
  }
    deleteItem(i: string, row: Employees) {
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
          // for delete we use splice in order to remove single object from DataService
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
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
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
      this.employeesService.deleteEmployees(item.id).subscribe({
        next: () => {
          const index: number = this.dataSource.renderedData.findIndex( (d) => d === item);
           // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
          this.exampleDatabase?.dataChange.value.splice(index, 1);
        }})
      
      this.refreshTable();
      this.selection = new SelectionModel<Employees>(true, []);
    });
    this.showNotification(
      'snackbar-danger',
      totalSelect + ' Record Delete Successfully...!!!',
      'bottom',
      'center'
    );
  }
  public loadData() {
    this.exampleDatabase = new EmployeesService(this.httpClient,this.ks);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
    );
    this.subs.sink = fromEvent<Event>(this.filter.nativeElement, 'keyup').pipe(
      map((event) => (event.target as HTMLInputElement).value.trim()),
    ).subscribe((value) => {
      if (!this.dataSource) return;
      this.dataSource.filter = value;
    });
  }
  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        Name: x.phone,
        Department: x.email,
        Role: x.grade,
        'Joining Date': formatDate(new Date(x.hireDate), 'yyyy-MM-dd', 'en') || '',
        Degree: x.email,
        Mobile: x.phone,
        Email: x.email,
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
  // context menu
  onContextMenu(event: MouseEvent, item: Employees) {
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




export class ExampleDataSource extends DataSource<Employees> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: Employees[] = [];
  renderedData: Employees[] = [];
  constructor(
    public exampleDatabase: EmployeesService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    

  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Employees[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    //this.exampleDatabase.getAllEmployeess();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((employees: Employees | undefined) => {
            if (!employees) return false;
            const searchStr = (
              employees.firstName +
              employees.lastName +
              employees.cin +
              employees.grade +
              employees.email +
              employees.phone +
              employees.address +
              employees.hireDate
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() {
    // disconnect
  }
  /** Returns a sorted copy of the database data. */
  sortData(data: Employees[]): Employees[] {
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
          case 'firstName':
              [propertyA, propertyB] = [a.firstName, b.firstName];
              break;
          case 'lastName':
              [propertyA, propertyB] = [a.lastName, b.lastName];
              break;
          case 'cin':
              [propertyA, propertyB] = [a.cin, b.cin];
              break;
          case 'grade':
              [propertyA, propertyB] = [a.grade, b.grade];
              break;
          case 'email':
              [propertyA, propertyB] = [a.email, b.email];
              break;
          case 'phone':
              [propertyA, propertyB] = [a.phone, b.phone];
              break;
          case 'address':
              [propertyA, propertyB] = [a.address, b.address];
              break;
          case 'hireDate':
              [propertyA, propertyB] = [new Date(a.hireDate).getTime(), new Date(b.hireDate).getTime()];
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
