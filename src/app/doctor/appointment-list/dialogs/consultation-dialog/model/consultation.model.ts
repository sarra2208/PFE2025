export class Consultation {
    id: string|null;
    appointmentId: string;
    date: string;
    status: string;
    notes: string;

    constructor(data: Partial<Consultation> = {}) {
        this.id = data.id || null;
        this.appointmentId = data.appointmentId || '';
        this.date = data.date || new Date().toISOString().slice(0, 16);
        this.status = data.status || '';
        this.notes = data.notes || '';
    }
}