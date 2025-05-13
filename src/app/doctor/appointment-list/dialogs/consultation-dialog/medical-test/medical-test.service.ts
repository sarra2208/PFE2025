import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MedicalTest } from '../model/medicalTest.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalTestService {
  private api = '/api/medical-tests';

  constructor(private http: HttpClient) {}

  saveMedicalTest(test: MedicalTest): Observable<MedicalTest> {
    return this.http.post<MedicalTest>(this.api, test);
  }

  getByPrescriptionId(prescriptionId: string): Observable<MedicalTest[]> {
    return this.http.get<MedicalTest[]>(`${this.api}/by-prescription/${prescriptionId}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
