export class ListPublicacionesDto {
  ordenar?: 'fecha' | 'likes';
  userId?: string;
  offset?: number;
  limit?: number;
}
