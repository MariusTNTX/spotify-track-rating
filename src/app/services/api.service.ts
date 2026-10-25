import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { PlaybackStateResponse, PlaylistResponse, SnapshotPostOperationResponse } from '../models/spotify-responses.model';
import { ConfigService } from './config.service';
import { FeedbackService } from './feedback.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly feedbackService = inject(FeedbackService);
  private readonly configService = inject(ConfigService);

  private readonly endpoints = this.configService.getEndpoints();

  public getPlaybackState(): Observable<PlaybackStateResponse | null> {
    const endpoint = this.endpoints().getPlaybackState;
    return this.http.get<PlaybackStateResponse>(endpoint.getUrl(), { ...endpoint.options, observe: 'response' }).pipe(
      tap((response) => {
        if (response.status === 204 || !response.body) {
          this.feedbackService.showInfo('El reproductor está desactivado o deshabilitado en este momento.');
        }
      }),
      map((response) => response.body)
    );
  }

  public getMainPlaylistData(): Observable<PlaylistResponse> {
    const endpoint = this.endpoints().getPlaylistData;
    return this.http.get<PlaylistResponse>(endpoint.getUrl(), endpoint.options);
  }

  public addTrackToPlaylist(trackId: string, playlistId: string): Observable<SnapshotPostOperationResponse> {
    const endpoint = this.endpoints().addItemToPlaylist;
    const body = endpoint.getBody ? endpoint.getBody(trackId) : {};
    return this.http.post<SnapshotPostOperationResponse>(endpoint.getUrl(playlistId), body, endpoint.options);
  }

  public deleteTrackFromMainPlaylist(trackId: string): Observable<SnapshotPostOperationResponse> {
    const endpoint = this.endpoints().removeItemToPlaylist;
    const body = endpoint.getBody ? endpoint.getBody(trackId) : {};
    return this.http.delete<SnapshotPostOperationResponse>(endpoint.getUrl(), { ...endpoint.options, body });
  }
  
  public skipToNextTrack(): Observable<void> {
    const endpoint = this.endpoints().skipToNextTrack;
    return this.http.post<void>(endpoint.getUrl(), endpoint.options);
  }

  public skipToPreviousTrack(): Observable<void> {
    const endpoint = this.endpoints().skipToPreviousTrack;
    return this.http.post<void>(endpoint.getUrl(), endpoint.options);
  }
  
  public startPlayback(): Observable<void> {
    const endpoint = this.endpoints().startPlayback;
    return this.http.put<void>(endpoint.getUrl(), {}, endpoint.options);
  }

  public pausePlayback(): Observable<void> {
    const endpoint = this.endpoints().pausePlayback;
    return this.http.put<void>(endpoint.getUrl(), {}, endpoint.options);
  }

  public shufflePlayback(): Observable<any> {
    const shuffleEndpoint = this.endpoints().shufflePlayback;
    return this.http.put<void>(shuffleEndpoint.getUrl(), {}, shuffleEndpoint.options);
  }

  public sortPlayback(): Observable<any> {
    const sortEndpoint = this.endpoints().sortPlayback;
    return this.http.put<void>(sortEndpoint.getUrl(), {}, sortEndpoint.options);
  }
}
