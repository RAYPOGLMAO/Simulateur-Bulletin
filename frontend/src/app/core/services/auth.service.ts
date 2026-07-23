import { Injectable, signal } from '@angular/core';
import { AuthUser } from '../models/budget.model';

const AUTH_STORAGE_KEY = 'btn_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readUser());

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.user();
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  updateUser(patch: Partial<AuthUser>): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, ...patch };
    this.setUser(updated);
  }

  clearUser(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.user.set(null);
  }
}
