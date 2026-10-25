import { computed, inject, Injectable, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { concat, interval, map, Observable, Subscription, take, tap } from 'rxjs';
import { PlaybackState, PlaylistData, RatingLevels } from '../models/custom-interfaces.model';
import { ApiService } from './api.service';

export interface SpotifyData {
  playbackState: PlaybackState | null,
  mainPlaylistData: PlaylistData | null,
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService implements OnDestroy {
  private apiService = inject(ApiService);

  private playbackState: WritableSignal<PlaybackState | null> = signal(null);
  private mainPlaylistData: WritableSignal<PlaylistData | null> = signal(null);

  public spotifyData: Signal<SpotifyData> = computed(() => ({
    playbackState: this.playbackState(),
    mainPlaylistData: this.mainPlaylistData(),
  }));

  private intervalMilliseconds: number = 300;
  private interval$: Observable<number> = interval(this.intervalMilliseconds);
  private intervalSubscription: Subscription | null = null;

  public ngOnDestroy(): void {
    this.pauseTrackTimer();
  }

  public getSpotifyData(): void {
    const endpoints = [this.getPlaybackState(), this.getMainPlaylistData()];
    concat(...endpoints).pipe(take(1)).subscribe();
  }

  public rateTrack(trackId: string, ratingLevel: RatingLevels): void {
    const endpoints: Observable<unknown>[] = [];

    if(ratingLevel !== RatingLevels.NONE){
      endpoints.push(this.apiService.addTrackToPlaylist(trackId, ratingLevel as string));
    }

    endpoints.push(
      this.apiService.deleteTrackFromMainPlaylist(trackId), 
      this.apiService.skipToNextTrack(),
      this.getPlaybackState(),
      this.getMainPlaylistData()
    );

    concat(...endpoints).pipe(take(1)).subscribe(() => this.initTrackTimer());
  }

  public skipToNextTrack(): void {
    const endpoints = [this.apiService.skipToNextTrack(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(1)).subscribe(() => this.initTrackTimer());
  }

  public skipToPreviousTrack(): void {
    const endpoints = [this.apiService.skipToPreviousTrack(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(1)).subscribe(() => this.initTrackTimer());
  }

  public startPlayback(): void {
    const endpoints = [this.apiService.startPlayback(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(1)).subscribe(() => this.initTrackTimer());
  }

  public pausePlayback(): void {
    const endpoints = [this.apiService.pausePlayback(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(1)).subscribe(() => this.pauseTrackTimer());
  }

  public reShufflePlayback(): void {
    const endpoints = [this.apiService.sortPlayback(), this.apiService.shufflePlayback()];
    concat(...endpoints).pipe(take(1)).subscribe();
  }

  private initTrackTimer(): void {
    if(this.intervalSubscription === null) {
      this.intervalSubscription = this.interval$.subscribe(() => 
        this.playbackState.update((state) => {
          if(state && state.currentMillisecons < state.totalMilliseconds){
            state.currentMillisecons += this.intervalMilliseconds;
            state.trackPercent = (state.currentMillisecons * 100) / state.totalMilliseconds
          } else {
            this.pauseTrackTimer();
          }
          return state;
        })
      );
    }
  }

  private pauseTrackTimer(): void {
    this.intervalSubscription?.unsubscribe();
    this.intervalSubscription = null;
  }

  private getPlaybackState(): Observable<PlaybackState> {
    return this.apiService.getPlaybackState()
      .pipe(
        map(response => ({
          trackId: response?.item?.id,
          trackName: response?.item?.name,
          albumName: response?.item?.album?.name,
          albumImageUrl: response?.item?.album?.images?.[0]?.url,
          artistName: response?.item?.artists?.map(artist => artist?.name)?.join(', '),
          currentMillisecons: response?.progress_ms,
          totalMilliseconds: response?.item?.duration_ms,
          isPlaying: response?.is_playing,
          isShuffled: response?.shuffle_state,
          trackPercent: 0
        } as PlaybackState)),
        map(data => ({ ...data, trackPercent: (data.currentMillisecons * 100) / data.totalMilliseconds })),
        tap(data => this.playbackState.set(data))
      );
  }

  private getMainPlaylistData(): Observable<PlaylistData> {
    return this.apiService.getMainPlaylistData()
      .pipe(
        map(response => ({
          remainingTracks: response?.items?.total,
          totalTracks: response.description ? parseInt(response.description) : null,
          playlistPercent: 0
        } as PlaylistData)),
        map(data => ({ ...data, playlistPercent: (data.remainingTracks * 100) / data.totalTracks })),
        tap(data => this.mainPlaylistData.set(data))
      );
  }
}
