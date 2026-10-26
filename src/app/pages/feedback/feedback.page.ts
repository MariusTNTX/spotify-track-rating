import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FeedbackData, isFeedbackData } from '../../services/feedback.service';
import { OauthService } from '../../services/oauth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-feedback-page.page',
  imports: [MatButtonModule],
  templateUrl: './feedback.page.html',
  styleUrl: './feedback.page.scss',
})
export class FeedbackPage {
  private router = inject(Router);
  private oauthService = inject(OauthService);

  public feedback = this.getFeedbackData(
    this.router.getCurrentNavigation()?.extras.state?.['feedback'] ??
      window.history.state?.feedback,
  );

  private getFeedbackData(value: unknown): FeedbackData {
    if (isFeedbackData(value)) {
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

  refreshAccessToken(): void {
    this.oauthService.refreshAccessToken();
  }
}
