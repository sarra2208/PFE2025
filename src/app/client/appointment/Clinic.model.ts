

export class Clinic {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    imageDir: string;
    uploadImg: File | null;

    constructor(clinic: Clinic) {
        this.id = clinic.id || this.getRandomID();
        this.name = clinic.name || '';
        this.address = clinic.address || '';
        this.phone = clinic.phone || '';
        this.email = clinic.email || '';
        this.imageDir = clinic.imageDir || 'assets/images/user/clinic.png';
        this.uploadImg = clinic.uploadImg || null;
    }

    public getRandomID(): number {
        const S4 = () => {
            return ((1 + Math.random()) * 0x10000) | 0;
        };
        return S4() + S4();
    }
}