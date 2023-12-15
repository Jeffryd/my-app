import { APP_INITIALIZER, Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18NextModule, ITranslationService, I18NEXT_SERVICE, I18NextTitle, defaultInterpolationFormat } from 'angular-i18next';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import I18NextXhrBackend from 'i18next-xhr-backend';
import i18nextBrowserLanguagedetector from 'i18next-browser-languagedetector';

export function appInit(i18next: ITranslationService) {
  return () => i18next
  .use(I18NextXhrBackend)
  .use(i18nextBrowserLanguagedetector)
  .init({
      supportedLngs: ['en', 'es'],
      fallbackLng: 'en',
      debug: true,
      returnEmptyString: false,
      ns: [
        'translation',
      ],
      interpolation: {
        format: I18NextModule.interpolationFormat(defaultInterpolationFormat)
      },
      backend: {
        loadPath: 'assets/locales/{{lng}}.{{ns}}.json',
      },
      // lang detection plugin options
      detection: {
        // order and from where user language should be detected
        order: ['querystring', 'cookie'],
        // keys or params to lookup language from
        lookupCookie: 'lang',
        lookupQuerystring: 'lng',
        // cache user language on
        caches: ['localStorage', 'cookie'],
        // optional expire and domain for set cookie
        cookieMinutes: 10080, // 7 days
      }
    });
}
export function localeIdFactory(i18next: ITranslationService)  {
  return i18next.language;
}
export const I18N_PROVIDERS = [
{
  provide: APP_INITIALIZER,
  useFactory: appInit,
  deps: [I18NEXT_SERVICE],
  multi: true
},
{
  provide: Title,
  useClass: I18NextTitle
},
{
  provide: LOCALE_ID,
  deps: [I18NEXT_SERVICE],
  useFactory: localeIdFactory
}];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, I18NextModule],
  providers: [I18N_PROVIDERS],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'my-app';

  language = 'en';
  languages: string[] = ['en', 'es'];
  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  ngOnInit(): void {
    this.i18NextService.events.initialized.subscribe(
      (e) => {
        if (e) {
          this.updateState(this.i18NextService.language);
        }
      }
    );
  }

  changeLanguage(lang: string){
    if (lang !== this.i18NextService.language) {
      this.i18NextService.changeLanguage(lang).then(x => {
        this.updateState(lang);
        document.location.reload();
      });
    }
  }

  private updateState(lang: string) {
    this.language = lang;
  }
}