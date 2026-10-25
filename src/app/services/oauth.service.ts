import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, from, map, Observable, of } from 'rxjs';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { SpotifyService } from './spotify.service';

interface SpotifyApiTokenResponse {
  access_token: string,
  token_type: 'Bearer',
  expires_in: number
}

@Injectable({
  providedIn: 'root',
})
export class OauthService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly storageService = inject(StorageService);
  private readonly spotifyService = inject(SpotifyService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly config = this.configService.getConfig();
  private readonly endpoints = this.configService.getEndpoints();

  public manageOAuth(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      this.redirectToAuthCodeFlow(this.config().clientId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    } else {
      this.getAccessTokenByCode(code)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((accessToken: string) => {
          this.storageService.setAccessToken(accessToken);
          this.spotifyService.getSpotifyData();
        });
    }
  }

  private redirectToAuthCodeFlow(clientId: string): Observable<void> {
    const verifier = this.generateCodeVerifier(128);
    return this.generateCodeChallenge(verifier).pipe(
      map((challenge) => {
        this.storageService.setVerifier(verifier);
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('response_type', 'code');
        params.append('redirect_uri', this.config().redirectUri || '');
        params.append('scope', this.config().scopes || '');
        params.append('code_challenge_method', 'S256');
        params.append('code_challenge', challenge);
        document.location = `${this.config().authUrl}?${params.toString()}`;
        return;
      }),
    );
  }

  private getAccessTokenByCode(code: string): Observable<string> {
    const accessToken = this.storageService.getAccessToken();
    if (accessToken) {
      return of(accessToken);
    }

    const verifier = this.storageService.getVerifier();

    const params = new URLSearchParams();
    params.append('client_id', this.config().clientId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.config().redirectUri || '');
    params.append('code_verifier', verifier!);

    const endpoint = this.endpoints().getApiToken;

    return this.http.post<SpotifyApiTokenResponse>(endpoint.getUrl(), params.toString(), endpoint.options).pipe(
      map((response) => response.access_token),
      catchError(() => EMPTY),
    );
  }

  private generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private generateCodeChallenge(codeVerifier: string): Observable<string> {
    const data = new TextEncoder().encode(codeVerifier);
    return from(window.crypto.subtle.digest('SHA-256', data)).pipe(
      map((digest: ArrayBuffer) =>
        btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, ''),
      ),
    );
  }
}
