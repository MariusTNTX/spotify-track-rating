import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isFeedbackData } from '../services/feedback.service';

export const feedbackGuard: CanActivateFn = () => {
  const router = inject(Router);
  const navigationState =
    router.getCurrentNavigation()?.extras.state ?? window.history.state;

  if (
    typeof navigationState === 'object' &&
    navigationState !== null &&
    isFeedbackData(navigationState['feedback'])
  ) {
    return true;
  }

  return router.createUrlTree(['/']);
};
