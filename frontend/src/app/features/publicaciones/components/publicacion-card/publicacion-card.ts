import { Component, input, output, computed, inject } from '@angular/core';
import { Publicacion } from '../../models/publicacion.model';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-publicacion-card',
  standalone: true,
  imports: [],
  templateUrl: './publicacion-card.html',
})
export class PublicacionCard {
  private readonly authService = inject(AuthService);

  readonly post = input.required<Publicacion>();
  readonly onLike = output<string>();
  readonly onDelete = output<string>();

  readonly currentUser = this.authService.currentUser;

  readonly isLiked = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return this.post().likes.includes(user._id);
  });

  readonly isOwner = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return this.post().autorData?._id === user._id || this.post().autor === user._id;
  });

  readonly isAdmin = computed(() => this.currentUser()?.perfil === 'administrador');

  readonly canDelete = computed(() => this.isOwner() || this.isAdmin());

  getInitials(nombre: string, apellido: string): string {
    return (nombre[0] + apellido[0]).toUpperCase();
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

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  like(): void {
    this.onLike.emit(this.post()._id);
  }

  delete(): void {
    this.onDelete.emit(this.post()._id);
  }
}
