import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'publicaciones',
        loadComponent: () => import('./features/publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil),
      },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
