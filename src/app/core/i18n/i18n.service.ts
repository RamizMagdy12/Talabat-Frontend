import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type AppLang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'talabat_lang';
  private dictionaries: Record<AppLang, Record<string, string>> = { en: {}, ar: {} };

  /** Bumps when dictionaries load or language changes so impure pipes refresh. */
  readonly version = signal(0);

  private currentLang: AppLang = this.readStoredLang();

  get lang(): AppLang {
    return this.currentLang;
  }

  get dir(): 'ltr' | 'rtl' {
    return this.lang === 'ar' ? 'rtl' : 'ltr';
  }

  async init(): Promise<void> {
    try {
      const [en, ar] = await Promise.all([
        firstValueFrom(this.http.get<Record<string, string>>('i18n/en.json')),
        firstValueFrom(this.http.get<Record<string, string>>('i18n/ar.json'))
      ]);
      this.dictionaries.en = en ?? {};
      this.dictionaries.ar = ar ?? {};
    } catch (err) {
      console.error('Failed to load i18n resources', err);
      this.dictionaries.en = {};
      this.dictionaries.ar = {};
    }

    this.applyDocument();
    this.version.update(v => v + 1);
  }

  setLang(lang: AppLang): void {
    if (lang !== 'en' && lang !== 'ar') return;
    this.currentLang = lang;
    localStorage.setItem(this.storageKey, lang);
    this.applyDocument();
    this.version.update(v => v + 1);
  }

  toggleLang(): void {
    this.setLang(this.lang === 'ar' ? 'en' : 'ar');
  }

  t(key: string, params?: Record<string, string | number>): string {
    // Depend on version so Angular re-evaluates pipes after load/switch.
    this.version();

    const dict = this.dictionaries[this.lang] || {};
    const fallback = this.dictionaries.en || {};
    let value = dict[key] ?? fallback[key] ?? key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }

    return value;
  }

  private readStoredLang(): AppLang {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'ar' || saved === 'en') return saved;
    const nav = (navigator.language || '').toLowerCase();
    return nav.startsWith('ar') ? 'ar' : 'en';
  }

  private applyDocument(): void {
    const html = document.documentElement;
    html.lang = this.lang;
    html.dir = this.dir;
    const name = this.t('app.name');
    const tagline = this.t('app.tagline');
    document.title = name.startsWith('app.') ? 'Talabat' : `${name} — ${tagline}`;
  }
}
