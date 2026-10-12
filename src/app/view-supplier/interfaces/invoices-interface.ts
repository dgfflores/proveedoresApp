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