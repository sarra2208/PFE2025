import { Page404Component } from '../authentication/page404/page404.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatComponent } from './chat/chat.component';
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./projects/projects.module').then((m) => m.ProjectsModule),
  },
 
  {
    path: 'appointment',
    loadChildren: () =>import('./appointment/appointment.module').then((m)=>m.AppointmentModule)
  },
 
  {
    path: 'chat',
    component: ChatComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },

  { path: '**', component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
