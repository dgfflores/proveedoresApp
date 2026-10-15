import { Service } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const grecaptcha: {
  ready(cb: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
};

@Service()
export class RecaptchaService {
  private script?: Promise<void>;

  execute(action: string): Promise<string> {
    return this.load().then(
      () =>
        new Promise<string>((resolve, reject) =>
          grecaptcha.ready(() =>
            grecaptcha.execute(environment.recaptchaSiteKey, { action }).then(resolve, reject),
          ),
        ),
    );
  }

  private load(): Promise<void> {
    return (this.script ??= new Promise<void>((resolve, reject) => {
      const el = document.createElement('script');
      el.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        this.script = undefined;
        reject(new Error('No se pudo cargar reCAPTCHA'));
      };
      document.head.appendChild(el);
    }));
  }
}
