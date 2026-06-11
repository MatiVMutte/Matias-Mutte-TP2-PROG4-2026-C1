import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Publicacion } from './models/publicacion.model';
import { PublicacionesService } from './services/publicaciones.service';
import { ToastService } from '../../shared/services/toast.service';
import { PublicacionCard } from './components/publicacion-card/publicacion-card';
import { NuevaPublicacionModal } from './components/nueva-publicacion-modal/nueva-publicacion-modal';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [PublicacionCard, NuevaPublicacionModal],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private readonly title = inject(Title);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly toast = inject(ToastService);

  readonly publicaciones = signal<Publicacion[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly showModal = signal(false);

  readonly ordenar = signal<'fecha' | 'likes'>('fecha');
  readonly offset = signal(0);
  readonly total = signal(0);
  readonly limit = 10;

  readonly hasMore = computed(() => this.offset() + this.limit < this.total());

  ngOnInit(): void {
    this.title.setTitle('Publicaciones | AllUTN');
    this.load(true);
  }

  load(reset = false): void {
    if (reset) {
      this.offset.set(0);
      this.publicaciones.set([]);
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.publicacionesService
      .getAll(this.ordenar(), this.offset(), this.limit)
      .subscribe({
        next: (res) => {
          if (reset) {
            this.publicaciones.set(res.publicaciones);
          } else {
            this.publicaciones.update(list => [...list, ...res.publicaciones]);
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

  cambiarOrden(orden: 'fecha' | 'likes'): void {
    if (this.ordenar() === orden) return;
    this.ordenar.set(orden);
    this.load(true);
  }

  loadMore(): void {
    this.offset.update(v => v + this.limit);
    this.load(false);
  }

  onLike(id: string): void {
    this.publicacionesService.toggleLike(id).subscribe({
      next: (res) => {
        this.publicaciones.update(list =>
          list.map(p => {
            if (p._id !== id) return p;
            const user = JSON.parse(localStorage.getItem('allutn_user') ?? '{}');
            const alreadyLiked = p.likes.includes(user._id);
            const newLikes = alreadyLiked
              ? p.likes.filter(l => l !== user._id)
              : [...p.likes, user._id];
            return { ...p, likes: newLikes, likesCount: res.likes };
          })
        );
      },
      error: (err: Error) => this.toast.error(err.message),
    });
  }

  onDelete(id: string): void {
    this.publicacionesService.delete(id).subscribe({
      next: () => {
        this.publicaciones.update(list => list.filter(p => p._id !== id));
        this.total.update(v => v - 1);
        this.toast.success('Publicación eliminada.');
      },
      error: (err: Error) => this.toast.error(err.message),
    });
  }

  onCreated(pub: Publicacion): void {
    this.showModal.set(false);
    this.load(true);
  }
}
