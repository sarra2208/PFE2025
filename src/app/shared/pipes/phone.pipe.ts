import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true
})
export class PhonePipe implements PipeTransform {

  transform(value: string | number, countryCode: string = 'FR'): string {
    if (!value) return '';

    let phone = value.toString().replace(/\D/g, ''); 

 
    switch (countryCode.toUpperCase()) {
      case 'FR': 
        if (phone.startsWith('0')) phone = phone.substring(1);
        return `+33 ${phone.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;

      case 'US': 
        return `+1 (${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;

      case 'UK': 
        return `+44 ${phone.substring(0, 4)} ${phone.substring(4)}`;
      case 'TN' :
        return `+216 ${phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 -$2-$3')}`;
      default:
        return phone; 
    }
  }

}
