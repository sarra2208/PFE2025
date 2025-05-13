  import { formatDate } from '@angular/common';
  export class Employees {
      id: number
      firstName: string
      lastName: string
      cin: string
      grade: string
      email: string
      phone: string
      address: string
      hireDate: string
      imageDir?:string
      uploadImg: File | null
      constructor(employees: Employees) {
          this.id = employees.id || this.getRandomID();
          this.firstName = employees.firstName || '';
          this.lastName = employees.lastName || '';
          this.cin = employees.cin || '';
          this.grade = employees.grade || '';
          this.email = employees.email || '';
          this.phone = employees.phone || '';
          this.address = employees.address || '';
          this.hireDate = formatDate(new Date(), 'yyyy-MM-dd', 'en') || '';
          this.imageDir= employees.imageDir ||"assets/images/user/employee.png"
          this.uploadImg = employees.uploadImg || null;
      }
      public getRandomID(): number {
        const S4 = () => {
          return ((1 + Math.random()) * 0x10000) | 0;
        };
        return S4() + S4();
      }  
  }
