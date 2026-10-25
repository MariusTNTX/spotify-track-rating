import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private _hasPendingRequests: WritableSignal<boolean> = signal(false);
  private pendingRequests = 0;

  public hasPendingRequests: Signal<boolean> = this._hasPendingRequests.asReadonly();

  public initRequest(): void {
    this.pendingRequests++;
    this._hasPendingRequests.set(true);
  }

  public finishRequest(): void {
    this.pendingRequests--;
    this._hasPendingRequests.set(this.pendingRequests > 0);
  }
}
