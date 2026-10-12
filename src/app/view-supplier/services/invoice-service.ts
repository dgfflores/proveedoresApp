import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { ClasificationInterface, ClasificationResponse, InvoiceUploadPayload, InvoiceUploadResponse } from '../interfaces/invoices-interface';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class InvoiceService {
    private readonly http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    public clasificationsSignal = signal<ClasificationInterface[]>([]);
    public readonly isLoading = signal<boolean>(false);

    public clasificationOptions = computed(() =>
        this.clasificationsSignal().map((c) => ({
            id: c.id,
            label: `${c.bussiness_name} ${c.location} ${c.rfc}`,
            name: c.bussiness_name,
            location: c.location,
            rfc: c.rfc,
        }))
    );

    uploadInvoice(data: InvoiceUploadPayload): Observable<InvoiceUploadResponse> {
        this.isLoading.set(true);

        const formData = new FormData();

        (['rfc_receptor', 'clasification_id', 'email_acuse', 'email_acuse_confirm'] as const)
            .forEach((key) => formData.append(key, String(data[key])));

        if (data.codigo_envio) formData.append('codigo_envio', data.codigo_envio);

        formData.append('xml_file', data.xml_file);
        formData.append('pdf_unico', data.pdf_unico);
        data.pdf_files?.forEach((file) => formData.append('pdf_files[]', file));

        return this.http
            .post<InvoiceUploadResponse>(`${this.apiUrl}/upload-invoice`, formData)
            .pipe(finalize(() => this.isLoading.set(false)));
    }

    setAllClasifications(): void {
        this.http
            .get<ClasificationResponse>(`${this.apiUrl}/clasifications`)
            .subscribe(({ data }) => this.clasificationsSignal.set(data));
    }
}
