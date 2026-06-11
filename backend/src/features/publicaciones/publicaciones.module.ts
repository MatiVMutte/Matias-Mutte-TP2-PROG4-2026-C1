import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { PublicacionesController } from './controllers/publicaciones.controller';
import { ComentariosController } from './controllers/comentarios.controller';
import { PublicacionesService } from './services/publicaciones.service';
import { ComentariosService } from './services/comentarios.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AuthModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentariosService],
  exports: [PublicacionesService, ComentariosService],
})
export class PublicacionesModule {}
