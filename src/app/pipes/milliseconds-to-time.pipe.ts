import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'millisecondsToTime',
  standalone: true,
})
export class MillisecondsToTimePipe implements PipeTransform {
  transform(milliseconds: number | null | undefined): string {
    const totalSeconds =
      typeof milliseconds === 'number' && Number.isFinite(milliseconds)
        ? Math.floor(Math.max(0, milliseconds) / 1000)
        : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
