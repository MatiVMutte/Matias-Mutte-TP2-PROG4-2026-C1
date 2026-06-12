import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { SupabaseStorageService } from '../../../shared/services/supabase-storage.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file ? await this.supabaseStorage.upload('avatars', file) : '';
    return this.authService.register(dto, avatarUrl);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(@Headers('authorization') authHeader: string | undefined) {
    if (!authHeader) {
      throw new UnauthorizedException('Token requerido.');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return this.authService.autorizar(token);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(@Headers('authorization') authHeader: string | undefined) {
    if (!authHeader) {
      throw new UnauthorizedException('Token requerido.');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    return this.authService.refrescar(token);
  }
}
