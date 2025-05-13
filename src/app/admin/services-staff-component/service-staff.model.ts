
export class ServiceStaff {
    id?: string;
    serviceId: string;
    staffId: string;
    status: string;
    shiftSchedule: string ;
    staffName?:string;
  
    constructor(data: Partial<ServiceStaff>) {
      this.id = data.id;
      this.serviceId = data.serviceId || '';
      this.staffId = data.staffId || '';
      this.status = data.status || '';
      this.shiftSchedule = data.shiftSchedule || "mon-fri 8:00-17:00";
    }
  }