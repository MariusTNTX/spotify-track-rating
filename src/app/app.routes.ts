import { Routes } from '@angular/router';
import { FeedbackPage } from './pages/feedback/feedback.page';
import { RatingPage } from './pages/rating/rating.page';

export const routes: Routes = [
  { path: '', component: RatingPage },
  { path: 'feedback', component: FeedbackPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
