export class ServiceStaff {
    id : string | null;
    serviceId?: string ;
    staffId?: string;
    shiftSchedule : string| null;
    status: string;

    constructor(serviceStaff: Partial<ServiceStaff> = {}) {
        this.id= serviceStaff.id || null;
        this.serviceId = serviceStaff.serviceId  ;
        this.staffId = serviceStaff.staffId ;
        this.shiftSchedule = serviceStaff.shiftSchedule || null;
        this.status = serviceStaff.status || 'active';
    }

   
}