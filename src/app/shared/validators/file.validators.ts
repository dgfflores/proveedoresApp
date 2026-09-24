import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type FileCheckError = 'invalidExtension' | 'maxSize';


export function singleFileValidator(extensionRegex: RegExp, maxSizeBytes?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File | null;
    if (!file) return null;
    if (!extensionRegex.test(file.name)) return { invalidExtension: true };
    if (maxSizeBytes && file.size > maxSizeBytes) return { maxSize: true };
    return null;
  };
}

export function multiFileValidator(extensionRegex: RegExp, maxFiles: number, maxSizeBytes?: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = (control.value as File[]) ?? [];
    if (!files.length) return null;
    if (files.length > maxFiles) return { maxFiles: true };
    if (files.some((f) => !extensionRegex.test(f.name))) return { invalidExtension: true };
    if (maxSizeBytes && files.some((f) => f.size > maxSizeBytes)) return { maxSize: true };
    return null;
  };
}

export function checkFile(file: File, extensionRegex: RegExp, maxSizeBytes?: number): FileCheckError | null {
  if (!extensionRegex.test(file.name)) return 'invalidExtension';
  if (maxSizeBytes && file.size > maxSizeBytes) return 'maxSize';
  return null;
}