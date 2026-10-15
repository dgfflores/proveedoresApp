import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loaderInterceptor } from './shared/interceptors/loader.interceptor';
import { captchaInterceptor } from './shared/interceptors/captcha.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors(
      [
        // authInterceptor, 
        // loaderInterceptor
        captchaInterceptor
      ])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
