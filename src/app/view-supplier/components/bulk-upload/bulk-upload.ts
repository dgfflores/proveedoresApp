import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PATRON_RFC } from '../../../shared/utils/expresions';
import { fieldsMatchValidator } from '../../../shared/validators/cfdi.validators';
import { WizardStep } from '../../../shared/utils/wizard-step';
import { getFormFieldError, isFieldInvalid } from '../../../shared/utils/form-error.utils';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';
import { multiFileValidator } from '../../../shared/validators/file.validators';
import { MultiFileUpload, RejectedFile } from '../../../shared/utils/multi-file-upload';
import { InvoiceService } from '../../services/invoice-service';

const MAX_XML_FILES = 50;
const XML_REGEX = /\.xml$/i;

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, WizardStepper],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.scss',
})

export class BulkUpload {
  private readonly fb = inject(FormBuilder);
  public readonly invoicesService = inject(InvoiceService);

  private readonly wizard = new WizardStep(2);
  public currentStep = this.wizard.current;

  public trackId = signal<string | null>(null);
  public division = signal<string | null>(null);

  constructor() {
    this.invoicesService.setAllClasifications();
  }

  public myForm: FormGroup = this.fb.group(
    {
      rfc_receptor: ['', [Validators.required, Validators.pattern(PATRON_RFC)]],
      razon_social: [null, [Validators.required]],
      email_acuse: ['', [Validators.required, Validators.email]],
      email_acuse_confirm: ['', [Validators.required, Validators.email]],
      xml_files: [[] as File[], [Validators.required, multiFileValidator(XML_REGEX, MAX_XML_FILES)]],
    },
    { validators: fieldsMatchValidator('email_acuse', 'email_acuse_confirm', 'emailMismatch') }
  );

  public readonly maxFiles = MAX_XML_FILES;
  public readonly xmlUpload = new MultiFileUpload(this.myForm.get('xml_files'), XML_REGEX, MAX_XML_FILES);
  public rejectedFiles = signal<RejectedFile[]>([]);


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
      required: () => field === 'xml_files'
        ? 'Debes cargar al menos un archivo XML.'
        : 'Este campo es requerido.',
      invalidExtension: () => 'Solo se permiten archivos .xml',
      maxFiles: () => `Máximo ${MAX_XML_FILES} archivos.`,
    });
  }

  private resolveDivisionLabel(): string {
    const id = this.myForm.get('razon_social')?.value;
    const c = this.invoicesService.clasificationOptions().find((o) => o.id === id);
    return c ? `${c.name} · ${c.location}` : '';
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

  onXmlSelected(event: Event): void {
    this.rejectedFiles.set(this.xmlUpload.onSelected(event));
  }

  onXmlDrop(event: DragEvent): void {
    this.rejectedFiles.set(this.xmlUpload.onDrop(event));
  }

  resetWizard(): void {
    this.myForm.reset();
    this.xmlUpload.reset();
    this.rejectedFiles.set([]);
    this.trackId.set(null);
    this.division.set(null);
    this.wizard.reset();
  }

}
