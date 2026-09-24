import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PATRON_UUID } from '../utils/expresions';

export function uuidValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = ((control.value as string) ?? '').trim();
    if (!value) return null;
    return new RegExp(PATRON_UUID).test(value) ? null : { invalidUuid: true };
  };
}

export function trackIdLengthValidator(length: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = ((control.value as string) ?? '').trim();
    if (!value) return null;
    return value.length === length ? null : { invalidLength: true };
  };
}

export function oneOfRequiredValidator(fieldA: string, fieldB: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(fieldA);
    const b = group.get(fieldB);
    if (!a || !b) return null;

    const hasA = !!(a.value as string)?.trim();
    const hasB = !!(b.value as string)?.trim();

    if (!hasA && !hasB) {
      a.setErrors({ ...(a.errors ?? {}), oneRequired: true });
      b.setErrors({ ...(b.errors ?? {}), oneRequired: true });
    } else {
      if (a.errors?.['oneRequired']) {
        const { oneRequired, ...rest } = a.errors;
        a.setErrors(Object.keys(rest).length ? rest : null);
      }
      if (b.errors?.['oneRequired']) {
        const { oneRequired, ...rest } = b.errors;
        b.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
    return null;
  };
}

export function fieldsMatchValidator(fieldName: string, confirmFieldName: string, errorKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const field = group.get(fieldName);
    const confirm = group.get(confirmFieldName);
    if (!field || !confirm) return null;

    if (confirm.value && field.value !== confirm.value) {
      confirm.setErrors({ ...(confirm.errors ?? {}), [errorKey]: true });
    } else if (confirm.errors?.[errorKey]) {
      const { [errorKey]: _removed, ...rest } = confirm.errors;
      confirm.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}