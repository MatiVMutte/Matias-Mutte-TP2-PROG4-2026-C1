import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/register/register').then(m => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'publicaciones',
        loadComponent: () => import('./features/publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      {
        path: 'publicaciones/:id',
        loadComponent: () => import('./features/publicaciones/pages/publicacion-detalle/publicacion-detalle').then(m => m.PublicacionDetalle),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil),
      },
      {
        path: 'dashboard/usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/dashboard/pages/usuarios/usuarios').then(m => m.DashboardUsuarios),
      },
      {
        path: 'dashboard/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/dashboard/pages/estadisticas/estadisticas').then(m => m.DashboardEstadisticas),
      },
      { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
