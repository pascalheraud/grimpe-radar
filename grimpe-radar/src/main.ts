/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TranslateService } from '@ngx-translate/core';
import { TRANSLATIONS } from './app/components/ban-autocomplete/ban-autocomplete-i18n';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const translate = appRef.injector.get(TranslateService);
    const browserLang = navigator.language.split('-')[0]; // Ex: "fr-FR" becomes "fr"
    translate.setDefaultLang('en');
    translate.use(browserLang in TRANSLATIONS ? browserLang : 'en');
  })
  .catch((err) => console.error(err));
