import { formatDate } from '@angular/common';
export class Calendar {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  details: string;

  constructor(calendar: Calendar) {
    {
      this.id = calendar.id || this.getRandomID.toString();
      this.title = calendar.title || '';
      this.category = calendar.category || '';
      this.startDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.endDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
      this.details = calendar.details || '';
    }
  }
  public getRandomID(): number {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return S4() + S4();
  }
}
export class Appointment {
  id: string;
  serviceStaffId: string;
  patientId: string;
  description: string;
  type: string;
  status: string;
  date: string;
  startDate: string;
  endDate: string;

  constructor(appointment: Partial<Appointment> = {}) {
    this.id = appointment.id || this.getRandomID();
    this.serviceStaffId = appointment.serviceStaffId || '';
    this.patientId = appointment.patientId || '';
    this.description = appointment.description || '';
    this.type = appointment.type || 'Consultation';
    this.status = appointment.status || 'Pending';
    this.date = appointment.date || new Date().toISOString().split('T')[0];
    this.startDate = appointment.startDate || new Date().toISOString();
    this.endDate = appointment.endDate || new Date().toISOString();
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  }
}
