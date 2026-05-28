import { Component, signal, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Publicacion } from './models/publicacion.model';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private readonly title = inject(Title);

  ngOnInit(): void { this.title.setTitle('Publicaciones | AllUTN'); }
  readonly publicaciones = signal<Publicacion[]>([
    {
      id: 1,
      autor: 'María González',
      avatar: '',
      fecha: 'hace 2 horas',
      titulo: 'Primer parcial de Programación IV',
      mensaje: '¡Acabo de rendir el primer parcial! Fue bastante desafiante pero creo que me fue bien. ¿Alguien más rindió hoy?',
      likes: 12,
      liked: false,
      comentarios: 4,
    },
    {
      id: 2,
      autor: 'Carlos Rodríguez',
      avatar: '',
      fecha: 'hace 5 horas',
      titulo: 'Apuntes de Sistemas Operativos',
      mensaje: 'Subo mis apuntes del módulo 3 de Sistemas Operativos. Espero les sirva a todos para preparar el final.',
      likes: 28,
      liked: false,
      comentarios: 9,
    },
    {
      id: 3,
      autor: 'Laura Martínez',
      avatar: '',
      fecha: 'hace 1 día',
      titulo: 'Grupo de estudio para Matemática III',
      mensaje: 'Estoy armando un grupo de estudio para Matemática III. ¿Alguien se suma? Nos juntamos los martes y jueves a las 18hs en el aula 204.',
      likes: 7,
      liked: false,
      comentarios: 15,
    },
  ]);

  toggleLike(id: number): void {
    this.publicaciones.update(list =>
      list.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
