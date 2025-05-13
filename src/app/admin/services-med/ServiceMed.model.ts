

export class ServiceMed {
  id: string;
  name: string;
  description: string;
  imageDir?: string;
  uploadImg: File | null;

  constructor(service: ServiceMed) {
    this.id = service.id || ServiceMed.getRandomID();
    this.name = service.name || '';
    this.description = service.description || '';
    this.imageDir = service.imageDir || "assets/images/service/default-service.png";
    this.uploadImg = service.uploadImg || null;
  }

  public static getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000) | 0;
    };
    return `${S4() + S4()}`;
  }
}