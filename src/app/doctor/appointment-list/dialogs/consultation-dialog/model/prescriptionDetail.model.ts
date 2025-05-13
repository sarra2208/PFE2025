export class PrescriptionDetail {
    id?: string | null;
    name: string;
    prescriptionId:string;
    packages:number;
    dosage: string ;
    frequency: string ;
    duration: string ;

    constructor(data: Partial<PrescriptionDetail> = {}) {
       this.id=data.id || null;
       this.name=data.name || ""
       this.packages=data.packages || 1 ;
       this.prescriptionId=data.prescriptionId || "";
       this.dosage = data.dosage || "" ;
       this.frequency=data.frequency || "";
       this.duration=data.duration || "";
    }

     
}