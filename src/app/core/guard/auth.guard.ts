// import { Injectable } from '@angular/core';
// import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// import { AuthService } from '../service/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard  {
//   constructor(private authService: AuthService, private router: Router) {}

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//     if (this.authService.currentUserValue) {
//       const userRole = this.authService.currentUserValue.role;
//       if (route.data['role'] && route.data['role'].indexOf(userRole) === -1) {
//         this.router.navigate(['/authentication/signin']);
//         return false;
//       }
//       return true;
//     }

//     this.router.navigate(['/authentication/signin']);
//     return false;
//   }
// }




import { KeycloakService } from "@core/service/keycloak/keycloak.service";
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from "@core/models/role.enum";


export const authGuard: CanActivateFn = (route) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);


  if (!keycloakService.keycloak?.authenticated) {
    router.navigate(['/authentication/signin']);
    return false;
  }

 
  if (keycloakService.keycloak.isTokenExpired()) {
    keycloakService.keycloak.login({ redirectUri: window.location.href });
    return false;
  }

 
  const requiredRoles = route.data['roles'] as Role[];
  if (requiredRoles?.length) {
    const userRoles = keycloakService.getUserRoles(); 
    const hasRole = requiredRoles.some(required => 
      userRoles.includes(required) || required === Role.All
    );
    
    if (!hasRole) {
      router.navigate(['/authentication/page401']);
      return false;
    }
  }

  return true;
};