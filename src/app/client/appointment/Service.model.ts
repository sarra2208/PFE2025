export class Service {
    id: number;
    name: string;
    role: string;
    description: string;
    clinicId: number;
    imageDir?: string;
    uploadImg?: File | null;

    constructor(service: Partial<Service> = {}) {
        this.id = service.id || this.getRandomID();
        this.name = service.name || '';
        this.role = service.role || '';
        this.description = service.description || '';
        this.clinicId = service.clinicId || 0;
        this.imageDir = service.imageDir || 'assets/images/default-service.png';
        this.uploadImg = service.uploadImg || null;
    }

    private getRandomID(): number {
        return Math.floor(Math.random() * 1000000);
    }
}