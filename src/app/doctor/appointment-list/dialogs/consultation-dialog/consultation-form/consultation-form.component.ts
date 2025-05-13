import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ConsultationService } from '../consultation.service';
import { Consultation } from '../model/consultation.model';


@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule 
],
  templateUrl: './consultation-form.component.html',
  styleUrl: './consultation-form.component.scss'
})
export class ConsultationFormComponent {
  @ViewChild('notes') noteTextarea!: ElementRef<HTMLTextAreaElement>;
  @Input() appointmentId ;
  readonly date=(new Date()).toISOString()
  consultationForm: FormGroup;
  consultationId:string|null=null;
  constructor(  private fb: FormBuilder,
    private consultationService: ConsultationService
  ) {
    this.consultationForm = this.fb.group({
      notes: ['', Validators.required],
    });
  }

  saveConsultation():Promise<string>{
    
    const consultation=new Consultation()
    consultation.id = this.consultationId ;
    consultation.appointmentId=this.appointmentId;
    consultation.notes=this.noteTextarea.nativeElement.value
    consultation.status="OnGoing"

    return new Promise((resolve, reject) => {
          this.consultationService.saveConsultation(consultation).subscribe({
          next : (data)=>{
            this.consultationId=data.id;
            this.appointmentCompleted()
            resolve(data.id);    
          },
          error: (err) => reject(err)
        })
    })

  }
  async appointmentCompleted(){
    this.consultationService.appointmentCompleted(this.appointmentId).subscribe();
  }

  goToUserProfile() {
    // Navigate to user profile logic
  }




  }

