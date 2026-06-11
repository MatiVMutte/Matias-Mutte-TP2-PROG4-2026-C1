import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from '../schemas/publicacion.schema';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async findByPublicacion(publicacionId: string, offset = 0, limit = 10) {
    const pub = await this.publicacionModel.findById(publicacionId);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const filter = {
      publicacionId: new Types.ObjectId(publicacionId),
      activo: true,
    };

    const comentarios = await this.comentarioModel
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: Number(offset) },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'autor',
            foreignField: '_id',
            as: 'autorData',
          },
        },
        { $unwind: { path: '$autorData', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            publicacionId: 1,
            mensaje: 1,
            modificado: 1,
            activo: 1,
            createdAt: 1,
            updatedAt: 1,
            'autorData._id': 1,
            'autorData.nombre': 1,
            'autorData.apellido': 1,
            'autorData.username': 1,
            'autorData.avatarUrl': 1,
          },
        },
      ])
      .exec();

    const total = await this.comentarioModel.countDocuments(filter);
    return { comentarios, total, offset: Number(offset), limit: Number(limit) };
  }
}
