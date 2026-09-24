import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PATRON_RFC } from '../../../shared/utils/expresions';
import { CompaniesService } from '../../services/companies-service';
import { checkFile, singleFileValidator } from '../../../shared/validators/file.validators';
import { fieldsMatchValidator } from '../../../shared/validators/cfdi.validators';
import { WizardStep } from '../../../shared/utils/wizard-step';
import { getFormFieldError, isFieldInvalid } from '../../../shared/utils/form-error.utils';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';
import { SingleFileUpload } from '../../../shared/utils/single-file-upload';

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, WizardStepper],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.scss',
})
export class BulkUpload {
  private readonly fb = inject(FormBuilder);
  public readonly companiesService = inject(CompaniesService);

  private readonly wizard = new WizardStep(2);
  public currentStep = this.wizard.current;

  public trackId = signal<string | null>(null);
  public division = signal<string | null>(null);
  public myForm: FormGroup = this.fb.group(
    {
      rfc_receptor: ['', [Validators.required, Validators.pattern(PATRON_RFC)]],
      razon_social: [null, [Validators.required]],
      email_acuse: ['', [Validators.required, Validators.email]],
      email_acuse_confirm: ['', [Validators.required, Validators.email]],
      zip_file: [null as File | null, [Validators.required, singleFileValidator(/\.zip$/i)]],
    },
    { validators: fieldsMatchValidator('email_acuse', 'email_acuse_confirm', 'emailMismatch') }
  );
  public readonly zipUpload = new SingleFileUpload(this.myForm.get('zip_file'), /\.zip$/i);

  goToStep(step: number): void {
    this.wizard.goTo(
      step,
      () => this.myForm.valid,
      () => this.myForm.markAllAsTouched(),
    );
  }

  nextStep(): void {
    const advanced = this.wizard.next(
      () => this.myForm.valid,
      () => this.myForm.markAllAsTouched(),
    );
    if (advanced) {
      this.trackId.set(this.generateTrackId());
      this.division.set(this.resolveDivisionLabel());
    }
  }

  prevStep(): void {
    this.wizard.prev();
  }

  blockPaste(event: Event): void {
    event.preventDefault();
  }

  isValidField(field: string): boolean {
    return isFieldInvalid(this.myForm.get(field));
  }

  getFieldError(field: string): string | null {
    return getFormFieldError(this.myForm.get(field), {
      invalidExtension: () => 'Solo se permiten archivos .zip',
    });
  }

  private resolveDivisionLabel(): string {
    const id = this.myForm.get('razon_social')?.value;
    const company = this.companiesService.companiesListSignal().find((c: any) => c.id === id);
    return company?.bussiness_name ?? '';
  }

  private generateTrackId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK-${timestamp}-${random}`;
  }

  copyTrackId(): void {
    const id = this.trackId();
    if (!id) return;
    navigator.clipboard?.writeText(id);
  }

  resetWizard(): void {
    this.myForm.reset();
    this.zipUpload.reset();
    this.trackId.set(null);
    this.division.set(null);
    this.wizard.reset();
  }

}
