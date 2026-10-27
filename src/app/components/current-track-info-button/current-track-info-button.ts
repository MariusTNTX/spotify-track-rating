import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MillisecondsToTimePipe } from '../../pipes/milliseconds-to-time.pipe';

@Component({
  selector: 'app-current-track-info-button',
  imports: [MatButtonModule, MatIconModule, MillisecondsToTimePipe],
  templateUrl: './current-track-info-button.html',
  styleUrl: './current-track-info-button.scss',
})
export class CurrentTrackInfoButton {
  @Input() currentMilliseconds?: number;
  @Input() totalMilliseconds?: number;
  @Input() percent?: number;
  @Output() press = new EventEmitter<boolean>();

  private isPressed = false;

  onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
    this.setPressed(true);
  }

  onPointerEnd(): void {
    this.setPressed(false);
  }

  private setPressed(isPressed: boolean): void {
    if (this.isPressed !== isPressed) {
      this.isPressed = isPressed;
      this.press.emit(isPressed);
    }
  }
}
