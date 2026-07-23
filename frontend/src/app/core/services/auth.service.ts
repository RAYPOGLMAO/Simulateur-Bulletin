import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthUser } from '../models/budget.model';

const TOKEN_KEY = 'btn_token';
const USER_KEY = 'btn_user';
const API_URL = '/api/auth';

interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.readStoredUser());
  readonly token = signal<string | null>(this.readStoredToken());

  constructor(private http: HttpClient) {}

  private readStoredToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return { firstName: parsed.name?.split(' ')[0] ?? '', lastName: parsed.name?.split(' ').slice(1).join(' ') ?? '', email: parsed.email, avatar: null };
    } catch { return null; }
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, { name, email, password }).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, { email, password }).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  fetchProfile(): Observable<any> {
    return this.http.get(`${API_URL}/me`).pipe(
      catchError(() => { this.clearUser(); return of(null); })
    );
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.user.set({
      firstName: res.user.name.split(' ')[0] ?? '',
      lastName: res.user.name.split(' ').slice(1).join(' ') ?? '',
      email: res.user.email,
      avatar: null
    });
  }

  updateUser(patch: Partial<AuthUser>): void {
    const current = this.user();
    if (!current) return;
    const updated = { ...current, ...patch };
    this.user.set(updated);
    const stored = { name: `${updated.firstName} ${updated.lastName}`.trim(), email: updated.email };
    localStorage.setItem(USER_KEY, JSON.stringify(stored));
  }

  clearUser(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  logout(): void {
    this.clearUser();
  }
}
