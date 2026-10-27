import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FeedbackData, isFeedbackData } from '../../services/feedback.service';
import { OauthService } from '../../services/oauth.service';
import { MatButtonModule } from '@angular/material/button';
import { filter, take } from 'rxjs';

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

  constructor() {
    const navigationState =
      this.router.getCurrentNavigation()?.extras.state ?? window.history.state;

    if (
      typeof navigationState === 'object' &&
      navigationState !== null &&
      isFeedbackData(navigationState['feedback'])
    ) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          take(1),
        )
        .subscribe(() => {
          const state = { ...window.history.state };
          Reflect.deleteProperty(state, 'feedback');
          window.history.replaceState(state, '');
        });
    }
  }

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
