import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';
import { PublicacionesService } from '../services/publicaciones.service';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { SupabaseStorageService } from '../../../shared/services/supabase-storage.service';

@UseGuards(JwtAuthGuard)
@Controller('publicaciones')
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreatePublicacionDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagenUrl = file ? await this.supabaseStorage.upload('posts', file) : '';
    return this.publicacionesService.create(dto, imagenUrl, user.sub);
  }

  @Get()
  async findAll(
    @Query('ordenar') ordenar?: 'fecha' | 'likes',
    @Query('userId') userId?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicacionesService.findAll({
      ordenar,
      userId,
      offset: offset ? Number(offset) : 0,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.publicacionesService.delete(id, user.sub, user.perfil);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.publicacionesService.like(id, user.sub);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.publicacionesService.unlike(id, user.sub);
  }
}
