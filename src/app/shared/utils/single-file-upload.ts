import { signal, WritableSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { checkFile } from '../validators/file.validators';

export class SingleFileUpload {
  public readonly fileName: WritableSignal<string | null> = signal(null);
  public readonly isDragging = signal(false);

  constructor(
    private readonly control: AbstractControl | null,
    private readonly extensionRegex: RegExp,
    private readonly maxSizeBytes?: number,
  ) {}

  onSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file) this.setFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) this.setFile(file);
  }

  remove(): void {
    this.fileName.set(null);
    this.control?.setValue(null);
    this.control?.markAsTouched();
  }

  reset(): void {
    this.fileName.set(null);
    this.isDragging.set(false);
  }

  private setFile(file: File): void {
    const error = checkFile(file, this.extensionRegex, this.maxSizeBytes);
    if (error) {
      this.control?.setErrors({ [error]: true });
      this.control?.markAsTouched();
      return;
    }
    this.fileName.set(file.name);
    this.control?.setValue(file);
    this.control?.markAsTouched();
  }
}