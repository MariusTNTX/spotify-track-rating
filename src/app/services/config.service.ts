import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

export interface CustomConfig {
  clientId: string,
  authUrl: string,
  productionOriginURL: string,
  productionURL: string,
  localURL: string,
  redirectUri?: string,
  scopes?: string,
  mainPlaylistId: string;
}

export interface CustomEndpointOptions {
  headers?: Record<string, string>,
  params?: Record<string, string>
}

export interface CustomEndpoint {
  getUrl: (id1?: string, id2?: string) => string,
  options: CustomEndpointOptions,
  scopes?: string[],
  getBody?: (id1?: string, id2?: string) => any,
}

export interface CustomEndpoints {
  getApiToken: CustomEndpoint,
  getPlaybackState: CustomEndpoint,
  getPlaylistData: CustomEndpoint,
  addItemToPlaylist: CustomEndpoint,
  removeItemToPlaylist: CustomEndpoint,
  skipToNextTrack: CustomEndpoint,
  skipToPreviousTrack: CustomEndpoint,
  startPlayback: CustomEndpoint,
  pausePlayback: CustomEndpoint,
  shufflePlayback: CustomEndpoint,
  sortPlayback: CustomEndpoint,
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  
  private configList: CustomConfig = {
    clientId: '0ab293bf7d6d4144b0423e6a237105fd',
    authUrl: 'https://accounts.spotify.com/authorize',
    productionOriginURL: 'https://mariustntx.github.io',
    productionURL: 'https://mariustntx.github.io/spotify-track-rating',
    localURL: 'http://127.0.0.1:4200/',
    mainPlaylistId: '4qDf6jrFI94ehHrlOyZMwp'
  };

  private endpointList: CustomEndpoints = {
    getApiToken: { 
      getUrl: () => 'https://accounts.spotify.com/api/token',
      options: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Error-Message': 'No se pudo completar la autenticación con Spotify.'
        }
      }
    },
    getPlaybackState: { 
      getUrl: () => 'https://api.spotify.com/v1/me/player',
      scopes: ['user-read-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo obtener la información del reproductor.' },
        params: { market: 'ES' }
      }
    },
    getPlaylistData: {
      getUrl: () => `https://api.spotify.com/v1/playlists/${this.configList.mainPlaylistId}`,
      options: {
        headers: { 'X-Error-Message': 'No se pudo obtener la información de la playlist principal.' },
        params: { market: 'ES', fields: 'description,items.total' }
      }
    },
    addItemToPlaylist: {
      getUrl: (playlistId) => `https://api.spotify.com/v1/playlists/${playlistId}/items`,
      scopes: ['playlist-modify-public', 'playlist-modify-private'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo añadir la canción en la playlist indicada.' }
      },
      getBody: (trackId) => ({ uris: [ `spotify:track:${trackId}` ] })
    },
    removeItemToPlaylist: {
      getUrl: () => `https://api.spotify.com/v1/playlists/${this.configList.mainPlaylistId}/items`,
      scopes: ['playlist-modify-public', 'playlist-modify-private'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo eliminar la canción de la playlist indicada.' }
      },
      getBody: (trackId) => ({ items: [{ uri: `spotify:track:${trackId}` }] })
    },
    skipToNextTrack: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/next',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo pasar a la siguiente canción.' }
      }
    },
    skipToPreviousTrack: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/previous',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo pasar a la canción anterior.' }
      }
    },
    startPlayback: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/play',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo reproducir la canción actual.' }
      }
    },
    pausePlayback: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/pause',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo pausar la canción actual.' }
      }
    },
    shufflePlayback: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/shuffle',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo aleatorizar la cola actual.' },
        params: { state: "true" }
      }
    },
    sortPlayback: {
      getUrl: () => 'https://api.spotify.com/v1/me/player/shuffle',
      scopes: ['user-modify-playback-state'],
      options: {
        headers: { 'X-Error-Message': 'No se pudo ordenar la cola actual.' },
        params: { state: "false" }
      }
    },
  };

  private _endpoints: WritableSignal<CustomEndpoints> = signal(this.endpointList);
  public getEndpoints(): Signal<CustomEndpoints> {
    return this._endpoints.asReadonly();
  }

  private _config: WritableSignal<CustomConfig> = signal({
    ...this.configList,
    redirectUri: this.getRedirectUri(),
    scopes: this.getScopes()
  });
  public getConfig(): Signal<CustomConfig> {
    return this._config.asReadonly();
  }

  private getRedirectUri(): string {
    return window.location.hostname === new URL(this.configList.productionOriginURL).hostname
      ? this.configList.productionURL
      : this.configList.localURL;
  }

  private getScopes(): string {
    const entries = Object.entries(this.endpointList);
    const scopes = entries.reduce((scopes: Set<string>, [_, endpoint]: [string, CustomEndpoint]) => {
      if(endpoint?.scopes){
        endpoint.scopes.map((scope) => scopes.add(scope));
      }
      return scopes;
    }, new Set<string>());
    return Array.from(scopes).join(' ');
  }
}
