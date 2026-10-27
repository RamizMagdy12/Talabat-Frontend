import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type AppLang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'talabat_lang';
  private dictionaries: Record<AppLang, Record<string, string>> = { en: {}, ar: {} };
  private ready = false;

  private readonly langSubject = new BehaviorSubject<AppLang>(this.readStoredLang());
  readonly lang$ = this.langSubject.asObservable();

  get lang(): AppLang {
    return this.langSubject.value;
  }

  get dir(): 'ltr' | 'rtl' {
    return this.lang === 'ar' ? 'rtl' : 'ltr';
  }

  async init(): Promise<void> {
    if (this.ready) {
      this.applyDocument();
      return;
    }

    const [en, ar] = await Promise.all([
      firstValueFrom(this.http.get<Record<string, string>>('/i18n/en.json')),
      firstValueFrom(this.http.get<Record<string, string>>('/i18n/ar.json'))
    ]);

    this.dictionaries.en = en ?? {};
    this.dictionaries.ar = ar ?? {};
    this.ready = true;
    this.applyDocument();
  }

  setLang(lang: AppLang): void {
    if (lang !== 'en' && lang !== 'ar') return;
    localStorage.setItem(this.storageKey, lang);
    this.langSubject.next(lang);
    this.applyDocument();
  }

  toggleLang(): void {
    this.setLang(this.lang === 'ar' ? 'en' : 'ar');
  }

  t(key: string, params?: Record<string, string | number>): string {
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
    document.title = this.t('app.tagline').includes('Talabat') || this.lang === 'en'
      ? `Talabat — ${this.t('app.tagline')}`
      : `${this.t('app.name')} — ${this.t('app.tagline')}`;
  }
}
