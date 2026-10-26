import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-current-track-info-sheet',
  imports: [],
  templateUrl: './current-track-info-sheet.html',
  styleUrl: './current-track-info-sheet.scss',
})
export class CurrentTrackInfoSheet {
  @Input() trackName?: string;
  @Input() albumName?: string;
  @Input() albumImageURL?: string;
  @Input() artistName?: string;
}
