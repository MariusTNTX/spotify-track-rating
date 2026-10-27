import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-playback-actions-menu',
  imports: [MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './playback-actions-menu.html',
  styleUrl: './playback-actions-menu.scss',
})
export class PlaybackActionsMenu {
  @Input() isPlaying?: boolean;
  @Input() mustReShuffle?: boolean = false;

  @Output() skipPrevious = new EventEmitter<void>();
  @Output() reShuffle = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() play = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() skipNext = new EventEmitter<void>();

  get mustDisable(): boolean {
    return this.isPlaying === undefined;
  }

  public onSkipPrevious(): void {
    this.skipPrevious.emit();
  }
  public onReShuffle(): void {
    this.reShuffle.emit();
  }
  public onPause(): void {
    this.pause.emit();
  }
  public onPlay(): void {
    this.play.emit();
  }
  public onRefresh(): void {
    this.refresh.emit();
  }
  public onSkipNext(): void {
    this.skipNext.emit();
  }
}
