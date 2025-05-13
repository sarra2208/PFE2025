import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RightSidebarService } from './service/rightsidebar.service';
import { throwIfAlreadyLoaded } from './guard/module-import.guard';
import { DirectionService } from './service/direction.service';
import { KeycloakService } from './service/keycloak/keycloak.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [RightSidebarService, KeycloakService, DirectionService],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  } 
}
