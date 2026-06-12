import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Publicacion } from '../../models/publicacion.model';
import { Comentario } from '../../models/comentario.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ComentariosService } from '../../services/comentarios.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly publicacion = signal<Publicacion | null>(null);
  readonly comentarios = signal<Comentario[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingMore = signal(false);
  readonly nuevoComentario = signal('');
  readonly isSubmitting = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly editText = signal('');

  readonly offset = signal(0);
  readonly total = signal(0);
  readonly limit = 5;
  readonly hasMore = computed(() => this.offset() + this.limit < this.total());

  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/publicaciones']);
      return;
    }
    this.loadPublicacion(id);
  }

  loadPublicacion(id: string): void {
    this.publicacionesService.getById(id).subscribe({
      next: (res) => {
        this.publicacion.set(res.publicacion);
        this.title.setTitle(`${res.publicacion.titulo} | AllUTN`);
        this.loadComentarios(id, true);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isLoading.set(false);
      },
    });
  }

  loadComentarios(publicacionId: string, reset = false): void {
    if (reset) {
      this.offset.set(0);
      this.comentarios.set([]);
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.comentariosService
      .getByPublicacion(publicacionId, this.offset(), this.limit)
      .subscribe({
        next: (res) => {
          if (reset) {
            this.comentarios.set(res.comentarios);
          } else {
            this.comentarios.update((list) => [...list, ...res.comentarios]);
          }
          this.total.set(res.total);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
        error: (err: Error) => {
          this.toast.error(err.message);
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        },
      });
  }

  loadMore(): void {
    const pub = this.publicacion();
    if (!pub) return;
    this.offset.update((v) => v + this.limit);
    this.loadComentarios(pub._id, false);
  }

  onCreateComentario(): void {
    const pub = this.publicacion();
    const mensaje = this.nuevoComentario().trim();
    if (!pub || !mensaje) return;

    this.isSubmitting.set(true);
    this.comentariosService.create(pub._id, mensaje).subscribe({
      next: (res) => {
        this.comentarios.update((list) => [res.comentario, ...list]);
        this.total.update((v) => v + 1);
        this.nuevoComentario.set('');
        this.isSubmitting.set(false);
      },
      error: (err: Error) => {
        this.toast.error(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  startEdit(com: Comentario): void {
    this.editandoId.set(com._id);
    this.editText.set(com.mensaje);
  }

  cancelEdit(): void {
    this.editandoId.set(null);
    this.editText.set('');
  }

  onUpdateComentario(com: Comentario): void {
    const pub = this.publicacion();
    const mensaje = this.editText().trim();
    if (!pub || !mensaje || mensaje === com.mensaje) {
      this.cancelEdit();
      return;
    }

    this.comentariosService.update(pub._id, com._id, mensaje).subscribe({
      next: (res) => {
        this.comentarios.update((list) =>
          list.map((c) => (c._id === com._id ? res.comentario : c))
        );
        this.cancelEdit();
      },
      error: (err: Error) => this.toast.error(err.message),
    });
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api', '')}${url}`;
  }

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

  isOwner(com: Comentario): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return com.autorData._id === user._id;
  }
}
