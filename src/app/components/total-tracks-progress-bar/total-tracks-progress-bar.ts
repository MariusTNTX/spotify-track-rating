import { Component, Input } from '@angular/core';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';

@Component({
  selector: 'app-total-tracks-progress-bar',
  imports: [ProgressBar],
  templateUrl: './total-tracks-progress-bar.html',
  styleUrl: './total-tracks-progress-bar.scss',
})
export class TotalTracksProgressBar {
  @Input() percent: number = 0;
  @Input() remainingTracks?: number;
}
