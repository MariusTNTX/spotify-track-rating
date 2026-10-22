import { Component, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-rating.page',
  imports: [],
  templateUrl: './rating.page.html',
  styleUrl: './rating.page.scss',
})
export class RatingPage {
  private spotifyService = inject(SpotifyService);

  public spotifyData = this.spotifyService.spotifyData;
}
