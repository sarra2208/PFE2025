export class Prescription {
    id?: string | null;
    prescriptionDate:string;
    consultationId:string;


    constructor(data: Partial<Prescription> = {}) {
       this.id=data.id || null;
       this.consultationId=data.consultationId || ""
       this.prescriptionDate=data.prescriptionDate || new Date().toISOString().slice(0, 16);

    }
   
}

