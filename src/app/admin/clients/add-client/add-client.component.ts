import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    FileUploadComponent,
    MatButtonModule,
  ],
})
export class AddClientComponent {
  clientForm: UntypedFormGroup;
  hide3 = true;
  agree3 = false;
  constructor(private fb: UntypedFormBuilder) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      date: ['', [Validators.required]],
      company_name: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      billing_method: ['', [Validators.required]],
      uploadImg: [''],
    });
  }
  onSubmit() {
    console.log('Form Value', this.clientForm.value);
  }
}
