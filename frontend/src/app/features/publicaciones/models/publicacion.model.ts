export interface Publicacion {
  id: number;
  autor: string;
  avatar: string;
  fecha: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  likes: number;
  liked: boolean;
  comentarios: number;
}
