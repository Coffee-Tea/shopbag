import { computed, effect, Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';
const THEME_KEY = 'shopbag-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');

      if (localStorage.getItem(THEME_KEY) !== theme) {
        localStorage.setItem(THEME_KEY, theme);
      }
    });
  }

  toggle(): void {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY);

    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
