import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RatingLevels } from '../../models/custom-interfaces.model';

interface RatingButton {
  id: RatingLevels,
  className: 'top' | 'good' | 'other' | 'reject',
  icon: 'star' | 'check' | 'question_mark' | 'close',
  label: string
}
@Component({
  selector: 'app-track-rating-button-grid',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './track-rating-button-grid.html',
  styleUrl: './track-rating-button-grid.scss',
})
export class TrackRatingButtonGrid {

  @Output() doubleClick: EventEmitter<RatingLevels> = new EventEmitter<RatingLevels>();
  private lastButtonClick: { ratingLevel: RatingLevels; timestamp: number } | null = null;

  public onButtonClick(ratingLevel: RatingLevels): void {
    const now = Date.now();
    const isDoubleClick =
      this.lastButtonClick?.ratingLevel === ratingLevel &&
      now - this.lastButtonClick.timestamp <= 500;

    if (isDoubleClick) {
      this.lastButtonClick = null;
      this.doubleClick.emit(ratingLevel);
      return;
    }

    this.lastButtonClick = { ratingLevel, timestamp: now };
  }

  public readonly ratingButtons: RatingButton[] = [
    {
      id: RatingLevels.TOP,
      className: 'top',
      icon: 'star',
      label: 'Top'
    },
    {
      id: RatingLevels.GOOD,
      className: 'good',
      icon: 'check',
      label: 'Good'
    },
    {
      id: RatingLevels.OTHER,
      className: 'other',
      icon: 'question_mark',
      label: 'Other'
    },
    {
      id: RatingLevels.NONE,
      className: 'reject',
      icon: 'close',
      label: 'Reject'
    },
  ];
}
