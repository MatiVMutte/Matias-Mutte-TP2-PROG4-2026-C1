export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil?: string;
  profileImage?: File | null;
}
