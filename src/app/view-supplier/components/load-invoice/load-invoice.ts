import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { PATRON_RFC } from '../../../shared/utils/expresions';
// import { generateDivision, generateMonto, generateUuid } from '../../../shared/utils/cfdi-mock.utils';
import { CfdiResult } from '../../../shared/components/cfdi-result/cfdi-result';
import { CfdiInfo } from '../../../shared/interfaces/status-view-invoice-interface';
import { isGroupValid, markFieldsTouched, WizardStep } from '../../../shared/utils/wizard-step';
import { getFormFieldError, isFieldInvalid } from '../../../shared/utils/form-error.utils';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';
import { checkFile, multiFileValidator, singleFileValidator } from '../../../shared/validators/file.validators';
import { fieldsMatchValidator } from '../../../shared/validators/cfdi.validators';
import { SingleFileUpload } from '../../../shared/utils/single-file-upload';
import { MultiFileUpload, RejectedFile } from '../../../shared/utils/multi-file-upload';
import { InvoiceService } from '../../services/invoice-service';

const MAX_PDF_FILES = 2;
const MAX_PDF_SIZE_MB = 2;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;


@Component({
  selector: 'app-load-invoice',
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, CfdiResult, WizardStepper],
  templateUrl: './load-invoice.html',
  styleUrl: './load-invoice.scss',
})
export class LoadInvoice {
  private readonly fb = inject(FormBuilder);
  public readonly invoiceService = inject(InvoiceService);


  private readonly wizard = new WizardStep(3);
  public currentStep = this.wizard.current;
  public trackId = signal<string | null>(null);
  public division = signal<string | null>(null);
  public cfdiInfo = signal<CfdiInfo | null>(null);

  public readonly maxPdfFiles = MAX_PDF_FILES;

  public banderaError: boolean = true;

  private readonly step1Fields = [
    'rfc_receptor',
    'clasification_id',
    'email_acuse',
    'email_acuse_confirm',
    'codigo_envio',
  ];

  public myForm: FormGroup = this.fb.group(
    {
      rfc_receptor: ['', [Validators.required, Validators.pattern(PATRON_RFC)]],
      clasification_id: [null, [Validators.required]],
      email_acuse: ['', [Validators.required, Validators.email]],
      email_acuse_confirm: ['', [Validators.required, Validators.email]],
      codigo_envio: ['', [Validators.maxLength(10)]],
      xml_file: [null as File | null, [Validators.required, singleFileValidator(/\.xml$/i)]],
      pdf_unico: [null as File | null, [Validators.required, singleFileValidator(/\.pdf$/i, MAX_PDF_SIZE_BYTES)]],
      pdf_files: [[] as File[], [multiFileValidator(/\.pdf$/i, MAX_PDF_FILES, MAX_PDF_SIZE_BYTES)]],
    },
    { validators: fieldsMatchValidator('email_acuse', 'email_acuse_confirm', 'emailMismatch') },
  );

  public readonly xmlUpload = new SingleFileUpload(this.myForm.get('xml_file'), /\.xml$/i);
  public readonly pdfUnicoUpload = new SingleFileUpload(this.myForm.get('pdf_unico'), /\.pdf$/i, MAX_PDF_SIZE_BYTES);
  public readonly pdfFilesUpload = new MultiFileUpload(this.myForm.get('pdf_files'), /\.pdf$/i, MAX_PDF_FILES, MAX_PDF_SIZE_BYTES);
  public readonly pdfFilesRejected = signal<string | null>(null);

  constructor() {
    this.invoiceService.setAllClasifications();
  }

  goToStep(step: number): void {
    this.wizard.goTo(
      step,
      () => this.isStep1Valid(),
      () => this.markStep1Touched(),
    );
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      this.wizard.next(
        () => this.isStep1Valid(),
        () => this.markStep1Touched(),
      );
      return;
    }

    if (this.currentStep() === 3) return;

    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const formValues = this.myForm.value;

    Swal.fire({
      title: 'Procesando factura...',
      text: 'Por favor espera mientras validamos tus archivos',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    console.log(formValues);
    // return;

    this.invoiceService.uploadInvoice(formValues).subscribe({
      next: (res) => {
        Swal.close();

        this.buildResult();

        this.trackId.set(res.data!.invoice!.track_id);
        this.division.set(res.data!.invoice!.division!);
        this.cfdiInfo.set({
          uuid: res.data!.invoice!.uuid,
          rfcReceptor: (formValues.rfc_receptor as string)!.toUpperCase(),
          moneda: 'MXN',
          monto: res.data!.invoice!.total,
        });
        this.currentStep.update((v) => v + 1);

        if (res.data?.has_repse) {
          Swal.fire({
            title: 'Clave REPSE detectada',
            text: res.message,
            icon: 'info',
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'No se pudo procesar',
          text: err.error?.message || 'Ocurrió un error al subir la factura y sus adjuntos.',
          icon: 'error',
        });
      },
    });

    // this.trackId.set(this.generateTrackId());
    // this.buildResult();
    // this.currentStep.update((v) => v + 1);
  }

  prevStep(): void {
    this.wizard.prev();
  }

  isStep1Valid(): boolean {
    return isGroupValid(this.myForm, this.step1Fields);
  }

  private markStep1Touched(): void {
    markFieldsTouched(this.myForm, this.step1Fields);
  }

  isValidField(field: string): boolean {
    return isFieldInvalid(this.myForm.get(field));
  }

  getFieldError(field: string): string | null {
    return getFormFieldError(this.myForm.get(field), {
      emailMismatch: () => 'Los correos no coinciden.',
      invalidExtension: () =>
        field === 'xml_file' ? 'El archivo debe tener extensión .xml' : 'Solo se permiten archivos .pdf',
      maxFiles: () => `Máximo ${MAX_PDF_FILES} archivos PDF.`,
      maxSize: () => `El archivo no debe exceder ${MAX_PDF_SIZE_MB}MB.`,
    });
  }

  blockPaste(event: Event): void {
    event.preventDefault();
  }

  formatSize(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private generateTrackId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK-${timestamp}-${random}`;
  }

  private buildResult(): void {
    // const formValue = this.myForm.value;
    // this.trackId.set(this.generateTrackId());
    // this.division.set(generateDivision());
    // this.cfdiInfo.set({
    //   uuid: generateUuid(),
    //   rfcReceptor: (formValue.rfc_receptor as string)?.toUpperCase() ?? '',
    //   moneda: 'MXN',
    //   monto: generateMonto(),
    // });
  }

  downloadPdf(): void {
    console.log('Descargando PDF del Track ID:', this.trackId());
  }

  onPdfSelected(event: Event): void {
    this.setPdfRejectedMessage(this.pdfFilesUpload.onSelected(event));
  }

  onPdfDrop(event: DragEvent): void {
    this.setPdfRejectedMessage(this.pdfFilesUpload.onDrop(event));
  }

  private setPdfRejectedMessage(rejected: RejectedFile[]): void {
    if (!rejected.length) {
      this.pdfFilesRejected.set(null);
      return;
    }
    const names = rejected.map((r) => r.name).join(', ');
    this.pdfFilesRejected.set(`No se agregaron (formato inválido o exceden ${MAX_PDF_SIZE_MB}MB): ${names}`);
  }

  resetWizard(): void {
    this.myForm.reset();
    this.pdfFilesUpload.reset();
    this.pdfFilesRejected.set(null);
    this.xmlUpload.reset();
    this.pdfUnicoUpload.reset();
    this.trackId.set(null);
    this.division.set(null);
    this.cfdiInfo.set(null);
    this.banderaError = true;
    this.wizard.reset();
  }
}

