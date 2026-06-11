import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;

  @Prop({ default: true })
  activo: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
