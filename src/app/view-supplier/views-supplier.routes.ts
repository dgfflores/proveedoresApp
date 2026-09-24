import { Routes } from '@angular/router';

export const routesViewsSupplier: Routes = [
    {
        path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome),
        title: 'Bienvenido',
    },
    {
        path: 'load-invoice',
        loadComponent: () => import('./components/load-invoice/load-invoice').then(m => m.LoadInvoice),
        title: 'Cargar CFDI',
    },
    {
        path: 'recovery-track',
        loadComponent: () => import('./components/recovery-track/recovery-track').then(m => m.RecoveryTrack),
        title: 'Recuperar seguimiento',
    },
    {
        path: 'bulk-upload',
        loadComponent: () => import('./components/bulk-upload/bulk-upload').then(m => m.BulkUpload),
        title: 'Carga masiva',
    },
    {
        path: 'upload-documentation',
        loadComponent: () => import('./components/upload-documentation/upload-documentation').then(m => m.UploadDocumentation),
        title: 'Cargar documentación',
    },
    { path: '**', redirectTo: 'welcome', pathMatch: 'prefix' },
];

export default routesViewsSupplier
