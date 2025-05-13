import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { ClientRoutingModule } from './client-routing.module';

@NgModule({
  imports: [
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    ClientRoutingModule,
  ],
})
export class ClientModule {}
