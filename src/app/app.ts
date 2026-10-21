import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  protected readonly title = signal('spotify-track-rating');
  private http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private clientId = '0ab293bf7d6d4144b0423e6a237105fd';
  private redirectUri = 'https://mariustntx.github.io/spotify-track-rating';
  private currentTrackDataUrl = 'https://api.spotify.com/v1/me/player/currently-playing?market=ES';
  private authUrl = 'https://accounts.spotify.com/authorize';
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private scopes = 'user-read-currently-playing';

  accessToken: string | null = null;
  trackData: any = null;
  trackStatus: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.accessToken = localStorage.getItem('spotify_access_token');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      this.redirectToAuthCodeFlow(this.clientId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    } else {
      this.getAccessToken(this.clientId, code)
        .pipe(
          switchMap((accessToken: string) => {
            this.accessToken = accessToken;
            localStorage.setItem('spotify_access_token', this.accessToken);
            return this.fecthCurrentTrackData();
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((trackData: any) => {
          this.trackData = trackData;
          console.log(this.trackData);
        });
    }
  }

  redirectToAuthCodeFlow(clientId: string): Observable<void> {
    const verifier = this.generateCodeVerifier(128);
    return this.generateCodeChallenge(verifier).pipe(
      map((challenge) => {
        localStorage.setItem('verifier', verifier);
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('response_type', 'code');
        params.append('redirect_uri', this.redirectUri);
        params.append('scope', this.scopes);
        params.append('code_challenge_method', 'S256');
        params.append('code_challenge', challenge);
        document.location = `${this.authUrl}?${params.toString()}`;
        return;
      }),
    );
  }

  generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  generateCodeChallenge(codeVerifier: string): Observable<string> {
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

  getAccessToken(clientId: string, code: string): Observable<string> {
    if (this.accessToken) {
      return of(this.accessToken);
    }

    const verifier = localStorage.getItem('verifier');

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);
    params.append('code_verifier', verifier!);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.http.post<any>(this.tokenUrl, params.toString(), { headers }).pipe(
      map((response) => response.access_token),
      catchError((err) => {
        this.errorMessage = `Error al obtener el token (${err.status}): ${err.error?.error_description || err.message}`;
        throw err;
      }),
    );
  }

  fecthCurrentTrackData(): Observable<any> {
    if (!this.accessToken) return of();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http.get<any>(this.currentTrackDataUrl, { headers, observe: 'response' }).pipe(
      tap((response) => {
        if (response.status === 204) {
          this.trackStatus = 'No hay ninguna canción reproduciéndose en este momento.';
        } else if (response.status === 200) {
          this.trackStatus = null;
        }
      }),
      map((response) => (response.status === 200 ? response.body : null)),
      catchError((err) => {
        this.errorMessage = `Error al consultar la canción [${err.status}]: ${err.error?.error?.message || err.message}`;
        if (err.status === 401) {
          localStorage.removeItem('spotify_access_token');
          this.accessToken = null;
        }
        return of(null);
      }),
    );
  }
}
