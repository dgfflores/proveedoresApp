export interface InvoiceUploadPayload {
  rfc_receptor: string;
  clasification_id: number;
  email_acuse: string;
  email_acuse_confirm: string;
  codigo_envio?: string;
  xml_file: File;
  pdf_unico: File;
  pdf_files?: File[];
}

export interface InvoiceUploadResponse {
  message: string;
  track_id: string;
  division?: string;
  cfdi_info?: {
    uuid: string;
    rfcReceptor: string;
    moneda: string;
    monto: number;
  };
  data?: {
    has_repse: boolean;
  };
}

export interface ClasificationInterface {
    id: number;
    company_id: number;
    alias: string;
    bussiness_name: string;
    rfc: string;
    location: string;
    air: string;
    consecutive: number;
    is_active: boolean;
}

export interface ClasificationResponse {
    data: ClasificationInterface[];
    error: boolean;
    message: string;
    statusCode: number;
}

export interface InvoiceLookupParams {
  rfc_receptor: string;
  uuid?: string;
  track_id?: string;
}

export interface InvoiceLookup {
  track_id: string;
  uuid: string;
  rfc_receptor: string;
  currency: string;
  total: string;
  division: string | null;
  status_sat: string | null;
  date: string | null;
}

export interface InvoiceLookupResponse {
  data: InvoiceLookup;
  error: boolean;
  message: string;
  statusCode: number;
}