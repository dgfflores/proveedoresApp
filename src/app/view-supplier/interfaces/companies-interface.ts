export interface CompanyInterface{
    id?: number;
    rfc: string;
    bussiness_name: string;
    is_active: boolean;
}

export interface CompanyResponse {
    data: CompanyInterface[];
    error: boolean;
    message: string;
    statusCode: number;
}
