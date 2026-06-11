import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ComentariosService } from '../services/comentarios.service';

@UseGuards(JwtAuthGuard)
@Controller('publicaciones/:publicacionId/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  async findAll(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.comentariosService.findByPublicacion(
      publicacionId,
      offset ? Number(offset) : 0,
      limit ? Number(limit) : 10,
    );
  }
}
