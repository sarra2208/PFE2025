import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

import { EmployeeRoutingModule } from './employee-routing.module';

@NgModule({
  imports: [
    EmployeeRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
})
export class EmployeeModule {}
