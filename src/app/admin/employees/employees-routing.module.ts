import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Page404Component } from "../../authentication/page404/page404.component";
import { AllemployeesComponent } from "./allEmployees/allemployees.component";
import { EmployeeProfileComponent } from "./employee-profile/employee-profile.component";
const routes: Routes = [
  {
    path: "allEmployees",
    component: AllemployeesComponent,
  },
  {
    path: "employee-profile",
    component: EmployeeProfileComponent,
  },
  { path: "**", component: Page404Component },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesRoutingModule {}
