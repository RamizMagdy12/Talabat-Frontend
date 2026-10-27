import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'locField',
  standalone: true,
  pure: false
})
export class LocFieldPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(english?: string | null, arabic?: string | null): string {
    this.i18n.version();
    if (this.i18n.lang === 'ar') {
      return (arabic?.trim() || english || '').toString();
    }
    return (english?.trim() || arabic || '').toString();
  }
}
