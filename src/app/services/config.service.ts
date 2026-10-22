import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

const PRODUCTION_ORIGIN = 'https://mariustntx.github.io';
const PRODUCTION_URL = `${PRODUCTION_ORIGIN}/spotify-track-rating`;
const LOCAL_URL = 'http://127.0.0.1:4200/';

export interface CustomConfig {
  clientId: string,
  redirectUri: string,
  authUrl: string,
  scopes: string,
  productionGitHubURL: string,
  productionURL: string,
  localURL: string,
}

export interface CustomEndpoint {
  url: string,
  headers: Record<string, string>,
}

export interface CustomEndpoints {
  apiToken: CustomEndpoint,
  currentTrack: CustomEndpoint,
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: WritableSignal<CustomConfig> = signal<CustomConfig>({
    clientId: '0ab293bf7d6d4144b0423e6a237105fd',
    redirectUri: this.getRedirectUri(),
    authUrl: 'https://accounts.spotify.com/authorize',
    scopes: 'user-read-currently-playing',
    productionGitHubURL: PRODUCTION_ORIGIN,
    productionURL: PRODUCTION_URL,
    localURL: LOCAL_URL
  });

  public getConfig(): Signal<CustomConfig> {
    return this.config.asReadonly();
  }

  private _endpoints: WritableSignal<CustomEndpoints> = signal<CustomEndpoints>({
    apiToken: { 
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Error-Message': 'No se pudo completar la autenticación con Spotify.',
      }
    },
    currentTrack: { 
      url: 'https://api.spotify.com/v1/me/player/currently-playing?market=ES',
      headers: {
        'X-Error-Message': 'No se pudo obtener la canción que se está reproduciendo.'
      }
    },
  });
  
  public getEndpoints(): Signal<CustomEndpoints> {
    return this._endpoints.asReadonly();
  }

  private getRedirectUri(): string {
    return window.location.hostname === new URL(PRODUCTION_ORIGIN).hostname
      ? PRODUCTION_URL
      : LOCAL_URL;
  }
}
