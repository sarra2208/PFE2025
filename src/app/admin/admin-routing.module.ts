import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('./employees/employees.module').then((m) => m.EmployeesModule),
  },
  {
    path:'appointments-list',
    loadComponent: () => import('./appointment-list/appointment-list.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'clinics-list',
    loadComponent: () => import('./clinics/clinics.component').then(m => m.ClinicsComponent),
  
  },
  
  {
    path: 'service-staff-list',
    loadComponent: () => import('./services-staff-component/service-staff.component').then(m => m.ServiceStaffComponent)
  },
  {
    path: 'all-services',
    loadComponent: () =>
      import('./services-med/all-services-med/all-holidays.component').then((m) => m.AllservicesComponent),
  }
  ,

  {
    path: 'clients',
    loadChildren: () =>
      import('./clients/clients.module').then((m) => m.ClientModule),
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
  },

  {
    path: 'attendance',
    loadChildren: () =>
      import('./attendance/attendance.module').then((m) => m.AttendanceModule),
  },
  {
    path: 'payroll',
    loadChildren: () =>
      import('./payroll/payroll.module').then((m) => m.PayrollModule),
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
