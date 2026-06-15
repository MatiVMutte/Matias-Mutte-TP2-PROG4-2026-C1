import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
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
import { UsersService } from '../services/users.service';
import { SupabaseStorageService } from '../../../shared/services/supabase-storage.service';

interface UpdateProfileBody {
  nombre?: string;
  apellido?: string;
  descripcion?: string;
  fechaNacimiento?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('perfil')
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('profileImage', {
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
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateProfileBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file ? await this.supabaseStorage.upload('avatars', file) : undefined;
    return this.usersService.updateProfile(user.sub, body, avatarUrl);
  }
}
