export class MedicalTest {
    id: string | null;
    prescriptionId: string;
    type: string;
    result: string;
  
    constructor(data: Partial<MedicalTest> = {}) {
      this.id = data.id || null;
      this.prescriptionId = data.prescriptionId || '';
      this.type = data.type || '';
      this.result = data.result || '';
    }
  }
  