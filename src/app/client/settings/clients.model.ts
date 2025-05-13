

export class Clients {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string | null;
  gender: string;
  mobile: string;
  email: string;

  insuranceID?: string | null;
  blobGroup?: string | null;
  height?: number | null;
  weight?: number | null;

  imageDir?: string | null;
  uploadImg: File | null;

  keycloakId?: string | null;

  constructor(client: Partial<Clients> = {}) {
    this.id = client.id || Clients.getRandomID();
    this.firstName = client.firstName || '';
    this.lastName = client.lastName || '';
    this.birthdate = client.birthdate || null ;
    this.gender = client.gender ||  '';
    this.mobile = client.mobile || '';
    this.email = client.email || '';

    this.insuranceID = client.insuranceID || null;
    this.blobGroup = client.blobGroup || null;
    this.height = client.height || null;
    this.weight = client.weight || null;

    this.imageDir = client.imageDir || 'assets/images/user/client.png';
    this.uploadImg = client.uploadImg || null;

    this.keycloakId = client.keycloakId || null;
  }

  public static getRandomID(): string {
    const S4 = () => ((1 + Math.random()) * 0x10000) | 0;
    return `${S4()}${S4()}`;
  }
}
