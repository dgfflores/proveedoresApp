import { AbstractControl } from '@angular/forms';

export type ErrorMessageMap = Record<string, (error: any) => string>;

const DEFAULT_MESSAGES: ErrorMessageMap = {
  required: () => 'Este campo es requerido.',
  pattern: () => 'El RFC no tiene un formato válido.',
  email: () => 'Ingresa un correo electrónico válido.',
  maxlength: (e) => `Máximo ${e.requiredLength} caracteres.`,
};

export function getFormFieldError(
  control: AbstractControl | null,
  customMessages: ErrorMessageMap = {},
): string | null {
  if (!control?.errors) return null;
  const errors = control.errors;
  const merged: ErrorMessageMap = { ...DEFAULT_MESSAGES, ...customMessages };

  for (const key of Object.keys(errors)) {
    if (merged[key]) return merged[key](errors[key]);
  }
  return 'Campo inválido.';
}

export function isFieldInvalid(control: AbstractControl | null): boolean {
  return !!control && control.invalid && (control.touched || control.dirty);
}