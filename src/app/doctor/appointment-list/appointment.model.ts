export class Appointment {
    id?: string;
    serviceStaffId: string;
    patientId: string;
    description: string;
    type: string;
    status: string;
    date: Date;
    startDate?: Date;
    endDate?: Date;

    constructor(data: Partial<Appointment> = {}) {
        this.id = data.id;
        this.serviceStaffId = data.serviceStaffId || '';
        this.patientId = data.patientId || '';
        this.description = data.description || '';
        this.type = data.type || '';
        this.status = data.status || '';
        this.date = data.date ? new Date(data.date) : new Date();
        this.startDate = data.startDate ? new Date(data.startDate) : undefined;
        this.endDate = data.endDate ? new Date(data.endDate) : undefined;
    }
}