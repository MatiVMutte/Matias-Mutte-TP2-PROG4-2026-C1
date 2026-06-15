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

  private async findWithAutorData(id: Types.ObjectId | string) {
    const result = await this.comentarioModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
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
    return result[0] ?? null;
  }

  async create(publicacionId: string, mensaje: string, autorId: string) {
    const pub = await this.publicacionModel.findById(publicacionId);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const created = await this.comentarioModel.create({
      publicacionId: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
      mensaje: mensaje.trim(),
    });

    const comentario = await this.findWithAutorData(created._id);
    return { comentario };
  }

  async update(publicacionId: string, id: string, mensaje: string, autorId: string) {
    const pub = await this.publicacionModel.findById(publicacionId);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const comentario = await this.comentarioModel.findOne({ _id: id, publicacionId: new Types.ObjectId(publicacionId), autor: new Types.ObjectId(autorId) });
    if (!comentario) throw new NotFoundException('Comentario no encontrado o no tenés permiso para editarlo.');

    comentario.mensaje = mensaje.trim();
    comentario.modificado = true;
    await comentario.save();

    const updated = await this.findWithAutorData(id);
    return { comentario: updated };
  }
}
