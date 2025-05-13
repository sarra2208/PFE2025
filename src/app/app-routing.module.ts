import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Page404Component } from './authentication/page404/page404.component';
import { authGuard } from './core/guard/auth.guard';
import { Role } from './core/models/role';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { Page401Component } from './authentication/page401/page401.component';

const routes: Routes = [
  { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
  {
    
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        data: { roles: [ Role.CompanyAdmin] },
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'employee',
        canActivate: [authGuard],
        data: { roles: [Role.Employee] },
        loadChildren: () =>
          import('./employee/employee.module').then((m) => m.EmployeeModule),
      },
      {
        path: 'client',
        canActivate: [authGuard],
        data: { roles: [Role.Client] },
        loadChildren: () =>
          import('./client/client.module').then((m) => m.ClientModule),
      },
      {
        path: 'doctor',
        canActivate: [authGuard],
       // data: { roles: [] },
        loadChildren: () =>
          import('./doctor/doctor.module').then((m) => m.DoctorModule),
      },
   
      {
        path: 'calendar',
        canActivate: [authGuard],
        data: { roles: [Role.Client,Role.CompanyAdmin, Role.Client] },
        loadChildren: () =>
          import('./calendar/calendar.module').then((m) => m.CalendarsModule),
      },
     
      {
        path: 'widget',
        data: { roles: [Role.CompanyAdmin] },
        loadChildren: () =>
          import('./widget/widget.module').then((m) => m.WidgetModule),
      },
      {
        path: 'ui',
        data: { roles: [Role.CompanyAdmin] },
        loadChildren: () => import('./ui/ui.module').then((m) => m.UiModule),
      },
      {
        path: 'forms',
        data: { roles: [Role.CompanyAdmin] },
        loadChildren: () =>
          import('./forms/forms.module').then((m) => m.FormModule),
      },

      {
        path: 'charts',
        data: { roles: [Role.CompanyAdmin] },
        loadChildren: () =>
          import('./charts/charts.module').then((m) => m.ChartsModule),
      },
      {
        path: 'timeline',
        data: { roles: [Role.CompanyAdmin] },
        loadChildren: () =>
          import('./timeline/timeline.module').then((m) => m.TimelineModule),
      },
   
      {
        path: 'extra-pages',
        data: { roles: [Role.All] }, 
        loadChildren: () =>
          import('./extra-pages/extra-pages.module').then(
            (m) => m.ExtraPagesModule
          ),
      },
    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
 
  { 
    path: 'page401', 
    component: Page401Component 
  },
  { 
    path: '**', 
    component: Page404Component 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}