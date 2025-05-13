import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.scss'],
  standalone: true,
  imports: [BreadcrumbComponent],
})
export class MyTeamsComponent {
  constructor() {
    // constructor
  }
}
