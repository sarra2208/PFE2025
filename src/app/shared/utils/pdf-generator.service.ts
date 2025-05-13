/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  public generatePrescriptionPdf(
    doctorName: string,
    patientName: string,
    consultationId: string,
    date: Date,
    prescriptions: any[]
  ) {
    const doc = new jsPDF();


    doc.setFontSize(18);
    doc.text('Medical Prescription', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Doctor: ${doctorName}`, 14, 35);
    doc.text(`Patient: ${patientName}`, 14, 43);
    doc.text(`Consultation ID: ${consultationId}`, 14, 51);
    doc.text(`Date: ${date.toLocaleDateString()}`, 14, 59);

   
    const tableBody = prescriptions.map((med: any, index: number) => [
      index + 1,
      med.name,
      med.dosage,
      med.packages.toString(),
      med.frequency,
      med.duration
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Medicine', 'Dosage', 'Packages', 'Frequency', 'Duration']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] }
    });


    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100;
    doc.text("Doctor's Signature:", 140, finalY + 30);
    doc.line(140, finalY + 32, 200, finalY + 32); 

    
    doc.save('prescription.pdf');
  }
}
