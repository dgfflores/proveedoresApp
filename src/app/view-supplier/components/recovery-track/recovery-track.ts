import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PATRON_RFC } from '../../../shared/utils/expresions';
import { generateDivision, generateMonto, generateTrackId, generateUuid } from '../../../shared/utils/cfdi-mock.utils';
import { CfdiResult } from '../../../shared/components/cfdi-result/cfdi-result';
import { CfdiInfo } from '../../../shared/interfaces/status-view-invoice-interface';
import { isGroupValid, markFieldsTouched, WizardStep } from '../../../shared/utils/wizard-step';
import { getFormFieldError, isFieldInvalid } from '../../../shared/utils/form-error.utils';
import { WizardStepper } from '../../../shared/components/wizard-stepper/wizard-stepper';
import { oneOfRequiredValidator, trackIdLengthValidator, uuidValidator } from '../../../shared/validators/cfdi.validators';
import { InvoiceLookup } from '../../interfaces/invoices-interface';
import { InvoiceService } from '../../services/invoice-service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const TRACK_ID_LENGTH = 20;

@Component({
  selector: 'app-recovery-track',
  imports: [CommonModule, ReactiveFormsModule, CfdiResult, WizardStepper],
  templateUrl: './recovery-track.html',
  styleUrl: './recovery-track.scss',
})
export class RecoveryTrack {
  private readonly fb = inject(FormBuilder);
  private readonly wizard = new WizardStep(2);
  public currentStep = this.wizard.current;

  public trackId = signal<string | null>(null);
  public division = signal<string | null>(null);
  public cfdiInfo = signal<CfdiInfo | null>(null);
  public loading = signal(false);
  public errorMessage = signal<string | null>(null);

  private readonly step1Fields = ['rfc_receptor', 'uuid', 'track_id'];
  private readonly destroyRef = inject(DestroyRef);
private readonly invoiceService = inject(InvoiceService);

  public myForm: FormGroup = this.fb.group(
    {
      rfc_receptor: ['', [Validators.required, Validators.pattern(PATRON_RFC)]],
      uuid: ['', [uuidValidator()]],
      track_id: ['', [trackIdLengthValidator(TRACK_ID_LENGTH)]],
    },
    { validators: oneOfRequiredValidator('uuid', 'track_id') },
  );

  goToStep(step: number): void {
    if (step === 2) {
      this.nextStep();
      return;
    }
    this.wizard.goTo(step, () => true, () => { });
  }

  nextStep(): void {
    if (this.loading()) return;

    if (!this.isStep1Valid()) {
      this.markStep1Touched();
      return;
    }

    const { rfc_receptor, uuid, track_id } = this.myForm.value;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.invoiceService
      .lookupInvoice({
        rfc_receptor: rfc_receptor.trim().toUpperCase(),
        uuid: uuid?.trim(),
        track_id: track_id?.trim(),
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (invoice) => {
          this.applyResult(invoice);
          this.wizard.next(() => true, () => { });
        },
        error: (err: HttpErrorResponse) =>
          this.errorMessage.set(err.error?.message ?? 'No se pudo consultar el CFDI.'),
      });
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
      invalidUuid: () => 'El UUID no tiene un formato válido.',
      invalidLength: () => `El Track ID debe tener exactamente ${TRACK_ID_LENGTH} caracteres.`,
      oneRequired: () => 'Debes capturar al menos el UUID o el Track ID.',
    });
  }

  private applyResult(invoice: InvoiceLookup): void {
    this.trackId.set(invoice.track_id);
    this.division.set(invoice.division);
    this.cfdiInfo.set({
      uuid: invoice.uuid,
      rfcReceptor: invoice.rfc_receptor,
      moneda: invoice.currency,
      monto: invoice.total,
    });
  }

  downloadPdf(): void {
    console.log('Descargando PDF del Track ID:', this.trackId());
  }

  resetWizard(): void {
    this.myForm.reset();
    this.trackId.set(null);
    this.division.set(null);
    this.cfdiInfo.set(null);
    this.wizard.reset();
  }
}
