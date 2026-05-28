export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil: 'usuario' | 'administrador';
  avatarUrl?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
