export interface ComentarioAutor {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  avatarUrl?: string;
}

export interface Comentario {
  _id: string;
  publicacionId: string;
  autorData: ComentarioAutor;
  mensaje: string;
  modificado: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComentariosResponse {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
}
