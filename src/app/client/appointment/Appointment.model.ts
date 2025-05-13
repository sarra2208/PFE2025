export class Appointment {
    id?: string | null;
    serviceStaffId: string;
    patientId: string;
    description: string;
    type?: string |   null;
    status: string;
    date: Date;
    startDate?: Date;
    endDate?: Date;
  
    constructor(appointment: Partial<Appointment>) {
      this.id = appointment.id || null;
      this.serviceStaffId = appointment.serviceStaffId || "1";
      this.patientId = appointment.patientId || "1";
      this.description = appointment.description || '';
      this.type = appointment.type || null;
      this.status = appointment.status || 'Pending';
      this.date = appointment.date || new Date();
      this.startDate = appointment.startDate;
      this.endDate = appointment.endDate;
    }
  }