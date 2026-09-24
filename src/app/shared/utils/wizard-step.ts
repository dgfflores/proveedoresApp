import { signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class WizardStep {
  public readonly current = signal(1);

  constructor(private readonly totalSteps: number) {}

  goTo(step: number, canLeaveCurrent: () => boolean, markTouched: () => void): void {
    if (step < this.current()) {
      this.current.set(step);
      return;
    }
    if (step > this.current()) {
      this.next(canLeaveCurrent, markTouched);
    }
  }

  next(canLeaveCurrent: () => boolean, markTouched: () => void): boolean {
    if (this.current() >= this.totalSteps) return false;

    if (!canLeaveCurrent()) {
      markTouched();
      return false;
    }
    this.current.update((v) => v + 1);
    return true;
  }

  prev(): void {
    if (this.current() > 1) this.current.update((v) => v - 1);
  }

  reset(): void {
    this.current.set(1);
  }
}

export function isGroupValid(form: FormGroup, fields: string[]): boolean {
  return fields.every((f) => form.get(f)?.valid);
}

export function markFieldsTouched(form: FormGroup, fields: string[]): void {
  fields.forEach((f) => form.get(f)?.markAsTouched());
}