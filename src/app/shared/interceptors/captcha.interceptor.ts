import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { RecaptchaService } from '../services/recaptcha-service';

export const CAPTCHA_ACTION = new HttpContextToken<string | null>(() => null);

export const captchaInterceptor: HttpInterceptorFn = (req, next) => {
  const action = req.context.get(CAPTCHA_ACTION);
  if (!action) return next(req);

  return from(inject(RecaptchaService).execute(action)).pipe(
    switchMap((token) => next(req.clone({ setHeaders: { 'X-Captcha-Token': token } }))),
  );
};