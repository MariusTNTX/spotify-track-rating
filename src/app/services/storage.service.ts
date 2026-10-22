import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly accessTokenKey = 'spotify_access_token';
  private readonly verifierKey = 'spotify_verifier';

  private _accessToken: WritableSignal<string | null> = signal(this.getAccessToken());
  public accessToken: Signal<string | null> = this._accessToken.asReadonly();

  public getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  public setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
    this._accessToken.set(token);
  }

  public removeAccessToken(): void {
    localStorage.removeItem(this.accessTokenKey);
    this._accessToken.set(null);
  }

  public getVerifier(): string | null {
    return localStorage.getItem(this.verifierKey);
  }

  public setVerifier(verifier: string): void {
    localStorage.setItem(this.verifierKey, verifier);
  }
}
