import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'btn_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>(this.readInitialTheme());

  constructor() {
    this.applyToDocument(this.theme());
  }

  private readInitialTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  }

  private applyToDocument(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggle(): void {
    this.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  set(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
    this.applyToDocument(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  current(): 'light' | 'dark' {
    return this.theme();
  }
}
