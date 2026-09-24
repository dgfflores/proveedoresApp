import { Service, signal } from '@angular/core';
import { CompanyInterface, CompanyResponse } from '../interfaces/companies-interface';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Service()
export class CompaniesService {
    public companiesListSignal = signal<CompanyInterface[]>([
        { id: 1, rfc: 'PHE7809257N4', bussiness_name: 'Parker Hannifin de México SA de CV', is_active: true },
        { id: 2, rfc: 'PBS9901011NA', bussiness_name: 'Parker Brownsville Servicios SA de CV', is_active: true },
        { id: 3, rfc: 'PIS9901011NA', bussiness_name: 'Parker Industrial S de RL de CV', is_active: false },
    ]);
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getCompanyById(id: number): Observable<CompanyResponse> {
        return this.http.get<CompanyResponse>(`${this.apiUrl}/users/${id}`);
    }
}
