import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { FeedbackService } from '../services/feedback.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptorService implements HttpInterceptor {
  private feedbackService = inject(FeedbackService);
  private storageService = inject(StorageService);

  private readonly errorMessageHeader = 'X-Error-Message';

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const requestErrorMessage = request.headers.get(this.errorMessageHeader);
    const isSpotifyApiRequest = /^https:\/\/api\.spotify\.com(?:\/|$)/i.test(request.url);

    if (!isSpotifyApiRequest && requestErrorMessage === null) {
      return next.handle(request);
    }

    const requestWithoutErrorMessage = request.headers.has(this.errorMessageHeader)
      ? request.clone({ headers: request.headers.delete(this.errorMessageHeader) })
      : request;

    return next.handle(requestWithoutErrorMessage).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          let message = 'Error desconocido al comunicarse con Spotify.';

          switch (error.status) {
            case 401:
              this.storageService.removeAccessToken();
              message = 'La sesión de Spotify ha caducado. Vuelve a iniciar sesión.';
              break;
            case 403:
              message = 'Spotify ha denegado el acceso a este recurso.';
              break;
            case 429:
              message = 'Se han realizado demasiadas solicitudes a Spotify. Inténtalo más tarde.';
              break;
            default:
              if (error.status >= 500 && error.status < 600) {
                message = 'Spotify no está disponible temporalmente. Inténtalo más tarde.';
              }
          }

          this.feedbackService.showError(error, message, requestErrorMessage ?? undefined);
        }

        return throwError(() => error);
      }),
    );
  }
}
