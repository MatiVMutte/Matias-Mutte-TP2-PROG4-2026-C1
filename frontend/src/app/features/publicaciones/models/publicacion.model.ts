export interface AutorData {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  avatarUrl?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagenUrl?: string;
  autor: string;
  autorData?: AutorData;
  likes: string[];
  likesCount: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicacionesResponse {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreatePublicacionPayload {
  titulo: string;
  mensaje: string;
  imagen?: File | null;
}
