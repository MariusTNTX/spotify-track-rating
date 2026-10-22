import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { catchError, map, of, take, tap } from 'rxjs';
import { CurrentTrack } from '../models/current-track-response.model';
import { ConfigService } from './config.service';
import { FeedbackService } from './feedback.service';

export interface SpotifyData {
  currentTrack: CurrentTrack | null
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private http = inject(HttpClient);
  private feedbackService = inject(FeedbackService);
  private configService = inject(ConfigService);
  private endpoints = this.configService.getEndpoints();

  private currentTrack: WritableSignal<CurrentTrack | null> = signal(null);

  public spotifyData: Signal<SpotifyData> = computed(() => ({
    currentTrack: this.currentTrack()
  }));

  public getCurrentTrack(): void {
    const url = this.endpoints().currentTrack?.url;
    const headers = this.endpoints().currentTrack?.headers;

    this.http.get<CurrentTrack>(url, { headers, observe: 'response' }).pipe(
      tap((response) => {
        if (response.status === 204) {
          this.feedbackService.showInfo('No hay ninguna canción reproduciéndose en este momento.');
        }
      }),
      map((response) => (response.status === 200 ? response.body : null)),
      take(1),
      catchError(() => of(null)),
    ).subscribe((data) => {
      this.currentTrack.set(data);
    });
  }
}
