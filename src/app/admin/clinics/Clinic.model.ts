export class Clinic {
    id?: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    imageDir?: string;
    uploadImg?: File;
  
    constructor(data: Partial<Clinic> = {}) {
      this.id = data.id;
      this.name = data.name || '';
      this.address = data.address || '';
      this.phone = data.phone || '';
      this.email = data.email || '';
      this.imageDir = data.imageDir;
      this.uploadImg = data.uploadImg;
    }
  }