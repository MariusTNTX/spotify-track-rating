import { computed, inject, Injectable, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
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
export class SpotifyService implements OnInit, OnDestroy {
  private apiService = inject(ApiService);

  private playbackState: WritableSignal<PlaybackState | null> = signal(null);
  private mainPlaylistData: WritableSignal<PlaylistData | null> = signal(null);

  public spotifyData: Signal<SpotifyData> = computed(() => ({
    playbackState: this.playbackState(),
    mainPlaylistData: this.mainPlaylistData(),
  }));

  private intervalMilliseconds: number = 250;
  private interval$: Observable<number> = interval(this.intervalMilliseconds);
  private intervalSubscription: Subscription | null = null;

  public ngOnInit(): void {
    this.initTrackTimer();
  }

  public ngOnDestroy(): void {
    this.pauseTrackTimer();
  }

  public getSpotifyData(): void {
    const endpoints = [this.getMainPlaylistData(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe();
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

    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => this.initTrackTimer());
  }

  public skipToNextTrack(): void {
    const endpoints = [this.apiService.skipToNextTrack(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => this.initTrackTimer());
  }

  public skipToPreviousTrack(): void {
    const endpoints = [this.apiService.skipToPreviousTrack(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => this.initTrackTimer());
  }

  public startPlayback(): void {
    const endpoints = [this.apiService.startPlayback(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => this.initTrackTimer());
  }

  public pausePlayback(): void {
    const endpoints = [this.apiService.pausePlayback(), this.getPlaybackState()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => this.pauseTrackTimer());
  }

  public reShufflePlayback(): void {
    const endpoints = [this.apiService.sortPlayback(), this.apiService.shufflePlayback()];
    concat(...endpoints).pipe(take(endpoints.length)).subscribe(() => {
      this.playbackState.update(state => {
        if(state){
          state.mustShuffle = false;
        }
        return state;
      });
    });
  }

  private initTrackTimer(): void {
    if(this.intervalSubscription === null) {
      this.intervalSubscription = this.interval$.subscribe(() => 
        this.playbackState.update((state) => {
          if(state && state.isPlaying) {
            if(state.currentMillisecons < state.totalMilliseconds) {
              state.currentMillisecons += this.intervalMilliseconds;
              state.trackPercent = (state.currentMillisecons * 100) / state.totalMilliseconds
            } else {
              this.getSpotifyData();
              this.playbackState.update(state => {
                if(state){
                  state.mustShuffle = true;
                }
                return state;
              });
            }
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
