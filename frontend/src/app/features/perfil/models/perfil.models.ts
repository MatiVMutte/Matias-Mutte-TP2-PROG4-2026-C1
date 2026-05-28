export interface Comentario {
  autor: string;
  texto: string;
  fecha: string;
}

export interface UltimaPublicacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  likes: number;
  comentarios: Comentario[];
}
