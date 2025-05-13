// import { Injectable } from "@angular/core";
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
// } from "@angular/common/http";
// import { Observable } from "rxjs";

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//   constructor(private authenticationService: AuthService) {}
//  // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   intercept(request: HttpRequest<any>,next: HttpHandler  ): Observable<HttpEvent<any>> {
//     // add authorization header with jwt token if available
//     const currentUser = this.authenticationService.currentUserValue;
//     if (currentUser && currentUser.token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });
//     }

//     return next.handle(request);
//   }
// }

// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { catchError, from, Observable, switchMap, throwError } from "rxjs";
import { KeycloakService } from "@core/service/keycloak/keycloak.service";


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return from(this.keycloakService.keycloak.updateToken(30)).pipe(
            switchMap(() => {
              if (this.keycloakService.keycloak?.token) {
                const newRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${this.keycloakService.keycloak.token}`
                  }
                });
                return next.handle(newRequest);
              }
              this.keycloakService.logout();
              return throwError(() => new Error('Token refresh failed'));
            }),
            catchError((error) => {
              this.keycloakService.logout();
              return throwError(() => error);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}