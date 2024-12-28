import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  
  if(authService.excludeUrlFromInterception(req.url))
    return next(req)

  return authService.getValidToken().pipe(
    switchMap(token =>{
      const authReq = req.clone({
        headers : req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq)
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(token => {
            const authReqRetry = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next(authReqRetry);
          })
        );
      }
      return throwError(() => error);
    })
  )
};