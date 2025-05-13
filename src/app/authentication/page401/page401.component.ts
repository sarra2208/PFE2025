import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page401',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page401.component.html',
  styleUrl: './page401.component.scss'
})
export class Page401Component {
  constructor(private router: Router) {}

  toHome(){
    this.router.navigate(['/']);
  }
}
