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
    return this.http.get<PlaybackStateResponse>(endpoint.getUrl(), { ...endpoint.options });
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
    return this.http
      .post(endpoint.getUrl(), {}, { ...endpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }

  public skipToPreviousTrack(): Observable<void> {
    const endpoint = this.endpoints().skipToPreviousTrack;
    return this.http
      .post(endpoint.getUrl(), {}, { ...endpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }
  
  public startPlayback(): Observable<void> {
    const endpoint = this.endpoints().startPlayback;
    return this.http
      .put(endpoint.getUrl(), {}, { ...endpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }

  public pausePlayback(): Observable<void> {
    const endpoint = this.endpoints().pausePlayback;
    return this.http
      .put(endpoint.getUrl(), {}, { ...endpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }

  public shufflePlayback(): Observable<void> {
    const shuffleEndpoint = this.endpoints().shufflePlayback;
    return this.http
      .put(shuffleEndpoint.getUrl(), {}, { ...shuffleEndpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }

  public sortPlayback(): Observable<void> {
    const sortEndpoint = this.endpoints().sortPlayback;
    return this.http
      .put(sortEndpoint.getUrl(), {}, { ...sortEndpoint.options, responseType: 'text' })
      .pipe(map((): void => undefined));
  }
}
