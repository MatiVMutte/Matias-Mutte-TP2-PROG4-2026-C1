import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { PublicacionesService } from '../publicaciones/services/publicaciones.service';
import { ToastService } from '../../shared/services/toast.service';
import { Publicacion } from '../publicaciones/models/publicacion.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly title = inject(Title);
  private readonly authService = inject(AuthService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly ultimasPublicaciones = signal<Publicacion[]>([]);
  readonly isLoading = signal(true);

  readonly API_URL = 'http://localhost:3001';

  ngOnInit(): void {
    this.title.setTitle('Mi perfil | AllUTN');
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.publicacionesService.getAll('fecha', 0, 3, user._id).subscribe({
      next: (res) => {
        this.ultimasPublicaciones.set(res.publicaciones);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return (user.nombre[0] + user.apellido[0]).toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
