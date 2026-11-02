import { computed, inject, Injectable, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { concat, finalize, interval, map, Observable, Subscription, switchMap, tap, timer } from 'rxjs';
import { PlaybackState, PlaylistData, RatingLevels } from '../models/custom-interfaces.model';
import { ApiService } from './api.service';
import { FeedbackService } from './feedback.service';
import { TrackObject } from '../models/spotify-objects.model';

export interface SpotifyData {
  playbackState: PlaybackState | null,
  mainPlaylistData: PlaylistData | null,
  queueData: TrackObject[],
  hasPendingRequests: boolean
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService implements OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly feedbackService = inject(FeedbackService);

  private playbackState: WritableSignal<PlaybackState | null> = signal(null);
  private mainPlaylistData: WritableSignal<PlaylistData | null> = signal(null);
  private queueData: WritableSignal<TrackObject[]> = signal([]);
  private hasPendingRequests: WritableSignal<boolean> = signal(false);

  private calculatedPlaybackState: Signal<PlaybackState | null> = computed(() => this.playbackState() !== null ? {
    ...this.playbackState(),
    trackPercent: this.playbackState() ? (this.playbackState()!.currentMillisecons * 100) / this.playbackState()!.totalMilliseconds : 0
  } as PlaybackState : null);

  private calculatedMainPlaylistData: Signal<PlaylistData | null> = computed(() => this.mainPlaylistData() !== null ? {
    ...this.mainPlaylistData(),
    playlistPercent: this.mainPlaylistData() ? ((this.mainPlaylistData()!.totalTracks - this.mainPlaylistData()!.remainingTracks) * 100) / this.mainPlaylistData()!.totalTracks : 0
  } as PlaylistData : null);

  public spotifyData: Signal<SpotifyData> = computed((): SpotifyData => ({
    playbackState: this.calculatedPlaybackState(),
    mainPlaylistData: this.calculatedMainPlaylistData(),
    queueData: this.queueData(),
    hasPendingRequests: this.hasPendingRequests(),
  }));

  private intervalMilliseconds: number = 250;
  private interval$: Observable<number> = interval(this.intervalMilliseconds);
  private intervalSubscription: Subscription | null = null;

  public ngOnDestroy(): void {
    this.pauseTrackTimer();
  }

  public getSpotifyData(): void {
    const endpoints: Observable<unknown>[] = [this.getMainPlaylistData(), this.getPlaybackState(), ...this.getQueueDataIfNeeded()];
    this.concatWithDelay(endpoints, 10).subscribe({ complete: () => this.initTrackTimer()});
  }

  public rateTrack(trackId: string, ratingLevel: RatingLevels): void {
    const endpoints: Observable<unknown>[] = [];

    if(ratingLevel !== RatingLevels.NONE){
      endpoints.push(this.apiService.addTrackToPlaylist(trackId, ratingLevel as string));
    }

    endpoints.push(
      this.apiService.deleteTrackFromMainPlaylist(trackId),
      ...this.getQueueDataIfNeeded(),
      this.apiService.skipToNextTrack()
    );

    this.concatWithDelay(endpoints).subscribe({
      complete: () => {
        this.updateNextTrackStateWithQueueData({ updateRemainingTracks: true });
        this.initTrackTimer();
      },
    });
  }

  public skipToNextTrack(): void {
    const endpoints = [...this.getQueueDataIfNeeded(), this.apiService.skipToNextTrack()];
    this.concatWithDelay(endpoints).subscribe({
      complete: () => {
        this.updateNextTrackStateWithQueueData({ updateRemainingTracks: false });
        this.initTrackTimer();
        this.playbackState.update(state => state ? { ...state, mustShuffle: true } : state );
      },
    });
  }

  public skipToPreviousTrack(): void {
    const endpoints = [this.apiService.skipToPreviousTrack(), this.getQueueData(), this.getPlaybackState()];
    this.concatWithDelay(endpoints).subscribe({
      complete: () => {
        this.initTrackTimer();
        this.playbackState.update(state => state ? { ...state, mustShuffle: true } : state );
      },
    });
  }

  public startPlayback(): void {
    const endpoints = [this.apiService.startPlayback()];
    this.concatWithDelay(endpoints).subscribe({ 
      complete: () => {
        this.initTrackTimer();
        this.playbackState.update((state) => state ? { ...state, isPlaying: true } : null);
      }
    });
  }

  public pausePlayback(): void {
    const endpoints = [this.apiService.pausePlayback()];
    this.concatWithDelay(endpoints).subscribe({
      complete: () => {
        this.playbackState.update((state) => state ? { ...state, isPlaying: false } : null);
        this.pauseTrackTimer();
      }
    });
  }

  public reShufflePlayback(): void {
    const endpoints = [this.apiService.sortPlayback(), this.apiService.shufflePlayback(), this.getQueueData()];
    this.concatWithDelay(endpoints).subscribe({
      complete: () => {
        this.playbackState.update(state =>
          state ? { ...state, mustShuffle: false } : state,
        );
      },
    });
  }

  private getQueueDataIfNeeded(): Observable<TrackObject[]>[] {
    return this.queueData().length <= 1 ? [this.getQueueData()] : [];
  }

  private updateNextTrackStateWithQueueData(options?: { updateRemainingTracks: boolean }): void {
    const queueTracks = this.queueData();
    const track = queueTracks.length > 0 ? queueTracks[0] : undefined;
    if(track) {
      const newState: PlaybackState = {
        trackId: track?.id || '',
        trackName: track?.name || 'Canción desconocida',
        albumName: track?.album?.name || 'Álbum desconocido',
        albumImageUrl: track?.album?.images?.[0]?.url || '',
        artistName: track?.artists?.map(artist => artist?.name)?.join(', ') || 'Artista desconocido',
        currentMillisecons: 0,
        totalMilliseconds: track?.duration_ms || 0,
        lastTimestamp: new Date().getTime(),
        isPlaying: true,
        isShuffled: true,
        mustShuffle: this.playbackState()?.mustShuffle || false,
        trackPercent: 0,
      };
      this.playbackState.update(state => state ? { ...newState } : state);
      if (options?.updateRemainingTracks) {
        this.mainPlaylistData.update(data => data ? { ...data, remainingTracks: data.remainingTracks - 1 } : data);
      }
      this.queueData.update(data => data.slice(1));
    }
  }

  private concatWithDelay(endpoints: Observable<unknown>[], ms: number = 300): Observable<unknown> {
    this.hasPendingRequests.set(true);
    return concat(
      ...endpoints.map((endpoint, index) =>
        index === 0 ? endpoint : timer(ms).pipe(switchMap(() => endpoint)),
      ),
    ).pipe(finalize(() => this.hasPendingRequests.set(false)));
  }

  private initTrackTimer(): void {
    const currentTime = new Date().getTime();
    
    this.playbackState.update(state =>
      state ? { ...state, lastTimestamp: currentTime - state.currentMillisecons } : state,
    );

    if(this.intervalSubscription === null) {
      this.intervalSubscription = this.interval$.subscribe(() => this.updateCurrentTrackMilliseconds());
    }
  }

  private updateCurrentTrackMilliseconds(): void {
    const currentTime = new Date().getTime();
    const state = this.playbackState();

    if (!state?.isPlaying) {
      return;
    }

    if (state.currentMillisecons < state.totalMilliseconds) {
      this.playbackState.update((currentState) => {
        if (!currentState) {
          return currentState;
        }
        const currentMillisecons = currentTime - currentState.lastTimestamp;
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
          lastTimestamp: new Date().getTime() - (response?.progress_ms || 0),
          isPlaying: response?.is_playing || false,
          isShuffled: response?.shuffle_state || true,
          mustShuffle: this.playbackState()?.mustShuffle || false,
          trackPercent: 0,
        })),
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
        tap(data => this.mainPlaylistData.set(data))
      );
  }

  private getQueueData(): Observable<TrackObject[]> {
    return this.apiService.getQueueData()
      .pipe(
        map((response): TrackObject[] => response?.queue || []),
        tap(data => this.queueData.set(data))
      );
  }
}
