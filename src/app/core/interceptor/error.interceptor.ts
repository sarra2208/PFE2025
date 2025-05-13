/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from "@angular/common/http";
import { from, Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { KeycloakService } from "../service/keycloak/keycloak.service"; 

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

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
