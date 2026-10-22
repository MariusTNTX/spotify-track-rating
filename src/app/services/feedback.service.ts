import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface FeedbackData {
  type: 'error' | 'info';
  message: string;
  detail?: string;
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
