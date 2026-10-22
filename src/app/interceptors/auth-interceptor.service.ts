import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  private storageService = inject(StorageService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!/^https:\/\/api\.spotify\.com(?:\/|$)/i.test(request.url)) {
      return next.handle(request);
    }

    const accessToken = this.storageService.getAccessToken();
    const authenticatedRequest = accessToken
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : request;

    return next.handle(authenticatedRequest);
  }
}
