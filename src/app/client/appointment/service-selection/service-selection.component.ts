import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Service } from '../Service.model';

@Component({
  selector: 'app-service-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './service-selection.component.html',
  styleUrls: ['./service-selection.component.scss']
})
export class ServiceSelectionComponent {
  @Input() services: Service[] = [];
  @Input() selectedServiceId: number | null = null;
  @Output() serviceSelected = new EventEmitter<{id: number,name:string}>();
  
  serviceDefaultImage = "assets/images/user/service.png";

  selectService(id: number, name:string) : void {
    this.serviceSelected.emit({"id":id, "name":name});
  }
}