import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Clinic } from '../Clinic.model';

@Component({
  selector: 'app-clinic-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './clinic-selection.component.html',
  styleUrls: ['./clinic-selection.component.scss']
})
export class ClinicSelectionComponent {
  @Input() clinics: Clinic[] = [];
  @Input() selectedClinicId: number | null = null;
  @Output() clinicSelected = new EventEmitter<number>();
  
  clinicDefaultImage = "assets/images/user/clinic.png";

  selectClinic(id: number): void {
    this.clinicSelected.emit(id);
  }
}