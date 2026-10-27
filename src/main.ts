import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { I18nService } from './app/core/i18n/i18n.service';
import './app/core/swal-theme';

bootstrapApplication(App, appConfig)
  .then(appRef => {
    const i18n = appRef.injector.get(I18nService);
    return i18n.init();
  })
  .catch((err) => console.error(err));
