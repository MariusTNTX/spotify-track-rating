import { Routes } from '@angular/router';
import { FeedbackPage } from './pages/feedback/feedback.page';
import { RatingPage } from './pages/rating/rating.page';
import { feedbackGuard } from './guards/feedback.guard';

export const routes: Routes = [
  { path: '', component: RatingPage },
  { path: 'feedback', component: FeedbackPage, canActivate: [feedbackGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
