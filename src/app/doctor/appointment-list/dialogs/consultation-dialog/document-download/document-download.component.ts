import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorService } from '@shared/utils/pdf-generator.service';
import { PrescriptionDetail } from '../model/prescriptionDetail.model';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-document-download',
  standalone: true,
  imports: [CommonModule,MatCardModule,],
  templateUrl: './document-download.component.html',
  styleUrl: './document-download.component.scss'
})
export class DocumentDownloadComponent {
  constructor(private pdfGeneratorService:PdfGeneratorService){}

@Output() prescriptionRequested = new EventEmitter<void>();

  onGeneratePrescription() {
    this.prescriptionRequested.emit();
  }


  generatePrescription(doctorName: string, patientName: string, consultationId: string, date: Date, prescriptions: PrescriptionDetail[]){
    this.pdfGeneratorService.generatePrescriptionPdf(doctorName,patientName,consultationId,date,prescriptions)
  }
  generateMedicalCertificate(){

  }


}
