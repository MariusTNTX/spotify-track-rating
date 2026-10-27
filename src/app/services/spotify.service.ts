import { computed, inject, Injectable, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { concat, interval, map, Observable, Subscription, switchMap, tap, timer } from 'rxjs';
import { PlaybackState, PlaylistData, RatingLevels } from '../models/custom-interfaces.model';
import { ApiService } from './api.service';
import { FeedbackService } from './feedback.service';

export interface SpotifyData {
  playbackState: PlaybackState | null,
  mainPlaylistData: PlaylistData | null,
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService implements OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly feedbackService = inject(FeedbackService);

  private playbackState: WritableSignal<PlaybackState | null> = signal(null);
  private mainPlaylistData: WritableSignal<PlaylistData | null> = signal(null);

  public spotifyData: Signal<SpotifyData> = computed(() => ({
    playbackState: this.playbackState(),
    mainPlaylistData: this.mainPlaylistData(),
  }));

  private intervalMilliseconds: number = 250;
  private interval$: Observable<number> = interval(this.intervalMilliseconds);
  private intervalSubscription: Subscription | null = null;

  public ngOnDestroy(): void {
    this.pauseTrackTimer();
  }

  public getSpotifyData(): void {
    const endpoints = [this.getMainPlaylistData(), this.getPlaybackState()];
    concat(...endpoints).subscribe(() => this.initTrackTimer());
  }

  public rateTrack(trackId: string, ratingLevel: RatingLevels): void {
    const endpoints: Observable<unknown>[] = [];

    if(ratingLevel !== RatingLevels.NONE){
      endpoints.push(this.apiService.addTrackToPlaylist(trackId, ratingLevel as string));
    }

    endpoints.push(
      this.apiService.deleteTrackFromMainPlaylist(trackId), 
      this.apiService.skipToNextTrack(),
      this.getMainPlaylistData(),
      this.getPlaybackState()
    );

    this.concatWithDelay(endpoints).subscribe(() => this.initTrackTimer(),);
  }

  public skipToNextTrack(): void {
    const endpoints = [this.apiService.skipToNextTrack(), this.getPlaybackState()];
    this.concatWithDelay(endpoints).subscribe(() => {
      this.initTrackTimer();
      this.playbackState.update(state =>
        state ? { ...state, mustShuffle: true } : state,
      );
    });
  }

  public skipToPreviousTrack(): void {
    const endpoints = [this.apiService.skipToPreviousTrack(), this.getPlaybackState()];
    this.concatWithDelay(endpoints).subscribe(() => {
      this.initTrackTimer();
      this.playbackState.update(state =>
        state ? { ...state, mustShuffle: true } : state,
      );
    });
  }

  public startPlayback(): void {
    const endpoints = [this.apiService.startPlayback()];
    concat(...endpoints).subscribe(() => {
      this.initTrackTimer();
      this.playbackState.update((state) => state ? { ...state, isPlaying: true } : null);
    });
  }

  public pausePlayback(): void {
    const endpoints = [this.apiService.pausePlayback()];
    concat(...endpoints).subscribe(() => {
      this.playbackState.update((state) => state ? { ...state, isPlaying: false } : null);
      this.pauseTrackTimer();
    });
  }

  public reShufflePlayback(): void {
    const endpoints = [this.apiService.sortPlayback(), this.apiService.shufflePlayback()];
    this.concatWithDelay(endpoints).subscribe(() => {
      this.playbackState.update(state =>
        state ? { ...state, mustShuffle: false } : state,
      );
    });
  }

  private concatWithDelay(endpoints: Observable<unknown>[], ms: number = 100): Observable<unknown> {
    return concat(
      ...endpoints.map((endpoint, index) =>
        index === 0 ? endpoint : timer(ms).pipe(switchMap(() => endpoint)),
      ),
    );
  }

  private initTrackTimer(): void {
    if(this.intervalSubscription === null) {
      this.intervalSubscription = this.interval$.subscribe(() => {
        const state = this.playbackState();

        if (!state?.isPlaying) {
          return;
        }

        if (state.currentMillisecons < state.totalMilliseconds) {
          this.playbackState.update((currentState) => {
            if (!currentState) {
              return currentState;
            }

            const currentMillisecons = currentState.currentMillisecons + this.intervalMilliseconds;
            return {
              ...currentState,
              currentMillisecons,
              trackPercent: (currentMillisecons * 100) / currentState.totalMilliseconds,
            };
          });
          return;
        }

        this.playbackState.update((currentState) =>
          currentState ? { ...currentState, mustShuffle: true } : currentState,
        );
        this.getSpotifyData();
      });
    }
  }

  private pauseTrackTimer(): void {
    this.intervalSubscription?.unsubscribe();
    this.intervalSubscription = null;
  }

  private getPlaybackState(): Observable<PlaybackState> {
    return this.apiService.getPlaybackState()
      .pipe(
        tap(response => {
          if (!response) {
            this.feedbackService.showInfo('El reproductor está desactivado o deshabilitado en este momento.');
          }
        }),
        map((response): PlaybackState => ({
          trackId: response?.item?.id || '',
          trackName: response?.item?.name || 'Canción desconocida',
          albumName: response?.item?.album?.name || 'Álbum desconocido',
          albumImageUrl: response?.item?.album?.images?.[0]?.url || '',
          artistName: response?.item?.artists?.map(artist => artist?.name)?.join(', ') || 'Artista desconocido',
          currentMillisecons: response?.progress_ms || 0,
          totalMilliseconds: response?.item?.duration_ms || 0,
          isPlaying: response?.is_playing || false,
          isShuffled: response?.shuffle_state || true,
          mustShuffle: this.playbackState()?.mustShuffle || false,
          trackPercent: 0
        })),
        map(data => ({ ...data, trackPercent: (data.currentMillisecons * 100) / data.totalMilliseconds })),
        tap(data => this.playbackState.set(data))
      );
  }

  private getMainPlaylistData(): Observable<PlaylistData> {
    return this.apiService.getMainPlaylistData()
      .pipe(
        map((response): PlaylistData => ({
          remainingTracks: response?.items?.total || 0,
          totalTracks: response.description ? parseInt(response.description) : 0,
          playlistPercent: 0
        })),
        map(data => ({ ...data, playlistPercent: ((data.totalTracks - data.remainingTracks) * 100) / data.totalTracks })),
        tap(data => this.mainPlaylistData.set(data))
      );
  }
}
