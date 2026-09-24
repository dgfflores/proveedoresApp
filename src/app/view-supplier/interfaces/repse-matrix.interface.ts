export interface RepseDocumentCategory {
  categoryName: string;
  code: string;
  documents: RepseDocumentItem[];
}

export interface RepseDocumentItem {
  id: string;
  codeNumber: string;
  name: string;
  description: string;
  required: boolean;
  badgeTag?: string;
}

export interface RepseConfigPayload {
  supplierId: number;
  linkExpirationHours: number;
  selectedDocumentIds: string[];
  sendEmailNotification: boolean;
}