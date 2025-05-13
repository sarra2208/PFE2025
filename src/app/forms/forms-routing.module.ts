import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FormExamplesComponent } from "./form-examples/form-examples.component";
import { FormValidationsComponent } from "./form-validations/form-validations.component";


import { AdvanceControlsComponent } from "./advance-controls/advance-controls.component";
const routes: Routes = [
  {
    path: "",
    redirectTo: "form-controls",
    pathMatch: "full",
  },

  {
    path: "advance-controls",
    component: AdvanceControlsComponent,
  },
  {
    path: "form-example",
    component: FormExamplesComponent,
  },
  {
    path: "form-validation",
    component: FormValidationsComponent,
  },


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormsRoutingModule {}
