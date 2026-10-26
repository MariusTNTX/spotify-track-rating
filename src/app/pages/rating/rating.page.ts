import { Component, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { TotalTracksProgressBar } from '../../components/total-tracks-progress-bar/total-tracks-progress-bar';
import { TrackRatingButtonGrid } from '../../components/track-rating-button-grid/track-rating-button-grid';
import { CurrentTrackInfoSheet } from '../../components/current-track-info-sheet/current-track-info-sheet';
import { CurrentTrackInfoButton } from '../../components/current-track-info-button/current-track-info-button';
import { PlaybackActionsMenu } from '../../components/playback-actions-menu/playback-actions-menu';
import { CommonActionsMenu } from '../../components/common-actions-menu/common-actions-menu';
import { RatingLevels } from '../../models/custom-interfaces.model';

@Component({
  selector: 'app-rating-page.page',
  imports: [TotalTracksProgressBar, TrackRatingButtonGrid, CurrentTrackInfoSheet, CurrentTrackInfoButton, PlaybackActionsMenu, CommonActionsMenu],
  templateUrl: './rating.page.html',
  styleUrl: './rating.page.scss',
})
export class RatingPage {
  private spotifyService = inject(SpotifyService);

  public spotifyData = this.spotifyService.spotifyData;

  moveTrackToPlaylist(ratingLevel: RatingLevels): void {
    console.log('ratingLevel:', ratingLevel);
  }
}
