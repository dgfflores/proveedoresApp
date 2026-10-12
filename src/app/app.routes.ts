import { Routes } from '@angular/router';
import { ContentLayout } from './shared/layouts/content-layout/content-layout';


export const routes: Routes = [
  {
    path: 'views-supplier',
    component: ContentLayout,
    loadChildren: () => import('./view-supplier/views-supplier.routes'),
  },
  {
    path: '**',
    redirectTo: 'views-supplier',
    pathMatch: 'full',
  }
];