import { Controller, Get, Post, Put, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('publicacionId') publicacionId: string,
    @Body('mensaje') mensaje: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.comentariosService.create(publicacionId, mensaje, user.sub);
  }

  @Put(':id')
  async update(
    @Param('publicacionId') publicacionId: string,
    @Param('id') id: string,
    @Body('mensaje') mensaje: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.comentariosService.update(publicacionId, id, mensaje, user.sub);
  }
}
