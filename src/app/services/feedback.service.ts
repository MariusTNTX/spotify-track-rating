import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface FeedbackData {
  type: 'error' | 'info' | 'success';
  message: string;
  detail?: string;
}

export function isFeedbackData(value: unknown): value is FeedbackData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'error' || value.type === 'info' || value.type === 'success') &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private router = inject(Router);

  public showError(error: HttpErrorResponse, message: string, detail?: string): void {
    console.error(`Error: ${message}`, error);
    this.navigateToFeedback({ type: 'error', message, detail });
  }

  public showInfo(message: string, detail?: string): void {
    console.info(`Info: ${message}`);
    this.navigateToFeedback({ type: 'info', message, detail });
  }

  private navigateToFeedback(feedback: FeedbackData): void {
    this.router.navigate(['/feedback'], { state: { feedback } });
  }
}
