import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RepseDocumentCategory } from '../../interfaces/repse-matrix.interface';

interface CfdiInfo {
  uuid: string;
  rfcReceptor: string;
  moneda: string;
  monto: string;
}

interface BarcodeBar {
  x: number;
  width: number;
}

const TRACK_ID_LENGTH = 20;

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-documentation.html',
  styleUrl: './upload-documentation.scss',
})
export class UploadDocumentation {
  private fb = inject(FormBuilder);

  public supplierName = signal<string>('SERVICIOS INDUSTRIALES Y LOGÍSTICA S.A. DE C.V.');
  public isSubmitting = signal<boolean>(false);

  public timeLeftSeconds = signal<number>(72 * 3600); 
  private timerInterval: any;

  public uploadedFiles = signal<Map<string, File>>(new Map());

  public fileErrorMsgs = signal<Map<string, string>>(new Map());

  public uploadForm: FormGroup = this.fb.group({});

  public categories = signal<RepseDocumentCategory[]>([
    {
      categoryName: '1. FISCALES Y NÓMINA (ISR / IVA)',
      code: 'CAT_ISR_IVA',
      documents: [
        { id: 'DOC_1_1', codeNumber: '1.1', name: 'DECLARACIÓN ISR Retenido por sueldos', description: 'Declaración mensual de retenciones', required: true, badgeTag: 'SAT' },
        { id: 'DOC_1_2', codeNumber: '1.2', name: 'ACUSE ISR Retenido por sueldos', description: 'Acuse oficial de presentación SAT', required: true, badgeTag: 'SAT' },
        { id: 'DOC_1_3', codeNumber: '1.3', name: 'PAGO DE ISR Retenido por sueldos', description: 'Comprobante bancario de liquidación', required: true, badgeTag: 'PAGO' },
        { id: 'DOC_1_4', codeNumber: '1.4', name: 'DECLARACIÓN IVA', description: 'Declaración mensual de IVA', required: true, badgeTag: 'SAT' },
        { id: 'DOC_1_5', codeNumber: '1.5', name: 'ACUSE IVA', description: 'Acuse oficial de presentación IVA', required: true, badgeTag: 'SAT' },
        { id: 'DOC_1_6', codeNumber: '1.6', name: 'PAGO DE IVA', description: 'Comprobante bancario de pago IVA', required: true, badgeTag: 'PAGO' },
        { id: 'DOC_1_7', codeNumber: '1.7', name: 'CFDI NÓMINA y Listado', description: 'Archivos PDF y XML del personal asignado', required: true, badgeTag: 'XML/PDF' }
      ]
    },
    {
      categoryName: '2. SEGURIDAD SOCIAL Y STPS',
      code: 'CAT_IMSS_REPSE',
      documents: [
        { id: 'DOC_2_1', codeNumber: '2.1', name: 'CÉDULAS IMSS-INFONAVIT', description: 'Cédulas de determinación de cuotas', required: true, badgeTag: 'IMSS' },
        { id: 'DOC_2_2', codeNumber: '2.2', name: 'SIPARE IMSS-INFONAVIT', description: 'Propuesta de pago generada en SIPARE', required: true, badgeTag: 'SIPARE' },
        { id: 'DOC_2_3', codeNumber: '2.3', name: 'PAGO IMSS-INFONAVIT', description: 'Comprobante bancario de liquidación', required: true, badgeTag: 'PAGO' },
        { id: 'DOC_2_4_A', codeNumber: '2.4', name: 'OPINIONES DE CUMPLIMIENTO', description: 'Sentido positivo (SAT, IMSS, INFONAVIT)', required: true, badgeTag: 'OPINIÓN' },
        { id: 'DOC_2_4_B', codeNumber: '2.4', name: 'Aviso Registro REPSE / Renovación', description: 'Aviso oficial vigente ante la STPS', required: true, badgeTag: 'STPS' },
        { id: 'DOC_2_5', codeNumber: '2.5', name: 'Acuse de informativa ICSOE-SISUB', description: 'Reportes cuatrimestrales requeridos', required: false, badgeTag: 'INFO' },
        { id: 'DOC_2_6', codeNumber: '2.6', name: 'Captura Portal REPSE (Vigencia)', description: 'Evidencia en sitio web repse.stps.gob.mx', required: true, badgeTag: 'STPS' }
      ]
    },
    {
      categoryName: '3. FORMALIZACIÓN LEGAL',
      code: 'CAT_LEGAL',
      documents: [
        { id: 'DOC_3_1', codeNumber: '3.1', name: 'Contrato de Servicios', description: 'Contrato especializado firmado entre las partes', required: true, badgeTag: 'LEGAL' }
      ]
    }
  ]);

  public totalRequiredDocs = computed(() => {
    return this.categories().reduce((acc, cat) => acc + cat.documents.length, 0);
  });

  public formattedTimeLeft = computed(() => {
    const total = this.timeLeftSeconds();
    if (total <= 0) return 'LIGA EXPIRADA';

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    return `${this.padZero(hours)}h : ${this.padZero(minutes)}m : ${this.padZero(seconds)}s`;
  });

  public isTimerWarning = computed(() => this.timeLeftSeconds() < 7200);

  ngOnInit(): void {
    this.buildDynamicForm();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private buildDynamicForm(): void {
    const group: Record<string, any> = {};
    this.categories().forEach(cat => {
      cat.documents.forEach(doc => {
        group[doc.id] = [null, doc.required ? Validators.required : []];
      });
    });
    this.uploadForm = this.fb.group(group);
  }

  private startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeftSeconds() > 0) {
        this.timeLeftSeconds.update(v => v - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onFileSelected(event: Event, docId: string, badgeTag: string): void {
    const input = event.target as HTMLInputElement;
    const errorsMap = new Map(this.fileErrorMsgs());

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name.toLowerCase();

      const isXmlPdf = badgeTag === 'XML/PDF';
      const isValid = isXmlPdf
        ? (fileName.endsWith('.pdf') || fileName.endsWith('.xml'))
        : fileName.endsWith('.pdf');

      if (!isValid) {
        const errorText = isXmlPdf
          ? 'El archivo no tiene la extensión requerida (.pdf o .xml).'
          : 'El archivo no tiene la extensión requerida, necesita un PDF (.pdf).';

        errorsMap.set(docId, errorText);
        this.fileErrorMsgs.set(errorsMap);

        input.value = '';
        return;
      }

      errorsMap.delete(docId);
      this.fileErrorMsgs.set(errorsMap);

      const updatedMap = new Map(this.uploadedFiles());
      updatedMap.set(docId, file);
      this.uploadedFiles.set(updatedMap);

      this.uploadForm.get(docId)?.setValue(file);
      this.uploadForm.get(docId)?.markAsTouched();
    }
  }

  removeFile(docId: string): void {
    const updatedMap = new Map(this.uploadedFiles());
    updatedMap.delete(docId);
    this.uploadedFiles.set(updatedMap);

    const errorsMap = new Map(this.fileErrorMsgs());
    errorsMap.delete(docId);
    this.fileErrorMsgs.set(errorsMap);

    this.uploadForm.get(docId)?.setValue(null);
  }

  hasFile(docId: string): boolean {
    return this.uploadedFiles().has(docId);
  }

  getFile(docId: string): File | undefined {
    return this.uploadedFiles().get(docId);
  }

  isDocInvalid(docId: string): boolean {
    const control = this.uploadForm.get(docId);
    return !!control && control.invalid && control.touched;
  }

  getFileIcon(filename: string = ''): string {
    return filename.toLowerCase().endsWith('.xml')
      ? 'bi-filetype-xml text-warning fs-5'
      : 'bi-file-earmark-pdf-fill text-danger fs-5';
  }

  getBadgeClass(tag: string): string {
    switch (tag) {
      case 'SAT': return 'bg-primary';
      case 'PAGO': return 'bg-success';
      case 'IMSS':
      case 'SIPARE':
      case 'OPINIÓN': return 'bg-info text-dark';
      case 'STPS':
      case 'XML/PDF': return 'bg-warning text-dark';
      case 'LEGAL': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  submitExpediente(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 1200);
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}