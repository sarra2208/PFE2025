import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Employees } from '../Employees.model';

@Component({
  selector: 'app-employee-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './employee-selection.component.html',
  styleUrls: ['./employee-selection.component.scss']
})
export class EmployeeSelectionComponent implements AfterViewInit {
  @Input() employees: Employees[] = [];
  @Input() selectedEmployeeId: number | null = null;
  @Input() selectedServiceId: number | null = null;
  @Input() listOfStaffId: string[] = [];
  @Output() employeeSelected = new EventEmitter<{name: string, id: number}>();
  
  employeeDefaultImage = "assets/images/user/employee.png";
  ngAfterViewInit(): void {
    console.log('listOfStaffId:', this.listOfStaffId);
  }
 
  selectEmployee(id: number, name:string): void {
    this.employeeSelected.emit({name: name, id: id});
   
  }
}