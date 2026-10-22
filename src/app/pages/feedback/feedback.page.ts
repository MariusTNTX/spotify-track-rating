import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FeedbackData } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback.page',
  imports: [],
  templateUrl: './feedback.page.html',
  styleUrl: './feedback.page.scss',
})
export class FeedbackPage {
  private router = inject(Router);

  public feedback = this.getFeedbackData(
    this.router.getCurrentNavigation()?.extras.state?.['feedback'] ??
      window.history.state?.feedback,
  );

  private getFeedbackData(value: unknown): FeedbackData {
    if (
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      (value.type === 'error' || value.type === 'info') &&
      'message' in value &&
      typeof value.message === 'string' &&
      (!('detail' in value) || typeof value.detail === 'string')
    ) {
      return {
        type: value.type,
        message: value.message,
        ...('detail' in value && typeof value.detail === 'string'
          ? { detail: value.detail }
          : {}),
      };
    }

    return { type: 'info', message: 'No hay información disponible.' };
  }
}
