import { signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { checkFile } from '../validators/file.validators';

export interface RejectedFile {
  name: string;
  reason: 'invalidExtension' | 'maxSize';
}

export class MultiFileUpload {
  public readonly files = signal<File[]>([]);
  public readonly isDragging = signal(false);

  constructor(
    private readonly control: AbstractControl | null,
    private readonly extensionRegex: RegExp,
    private readonly maxFiles: number,
    private readonly maxSizeBytes?: number,
  ) {}

  get hasSlotsAvailable(): boolean {
    return this.files().length < this.maxFiles;
  }

  onSelected(event: Event): RejectedFile[] {
    const input = event.target as HTMLInputElement;
    const rejected = this.add(Array.from(input.files ?? []));
    input.value = '';
    return rejected;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.hasSlotsAvailable) this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): RejectedFile[] {
    event.preventDefault();
    this.isDragging.set(false);
    if (!this.hasSlotsAvailable) return [];
    return this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  remove(index: number): void {
    const updated = this.files().filter((_, i) => i !== index);
    this.files.set(updated);
    this.syncControl(updated);
  }

  reset(): void {
    this.files.set([]);
    this.isDragging.set(false);
  }

  private add(newFiles: File[]): RejectedFile[] {
    const available = this.maxFiles - this.files().length;
    if (available <= 0) return [];

    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];

    for (const file of newFiles) {
      if (accepted.length >= available) break;
      const error = checkFile(file, this.extensionRegex, this.maxSizeBytes);
      if (error) {
        rejected.push({ name: file.name, reason: error });
      } else {
        accepted.push(file);
      }
    }

    if (accepted.length) {
      const updated = [...this.files(), ...accepted];
      this.files.set(updated);
      this.syncControl(updated);
    }

    return rejected;
  }

  private syncControl(files: File[]): void {
    this.control?.setValue(files);
    this.control?.markAsTouched();
  }
}