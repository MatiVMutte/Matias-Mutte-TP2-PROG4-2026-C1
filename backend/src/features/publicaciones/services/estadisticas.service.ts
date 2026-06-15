import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from '../schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';

interface RangoFechas {
  desde?: string;
  hasta?: string;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

  private buildDateFilter({ desde, hasta }: RangoFechas) {
    const filter: Record<string, Date> = {};
    if (desde) filter.$gte = new Date(desde);
    if (hasta) {
      const fin = new Date(hasta);
      fin.setHours(23, 59, 59, 999);
      filter.$lte = fin;
    }
    return Object.keys(filter).length ? { createdAt: filter } : {};
  }

  async publicacionesPorUsuario(rango: RangoFechas) {
    const match = this.buildDateFilter(rango);
    const data = await this.publicacionModel.aggregate([
      { $match: match },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          usuario: { $concat: ['$usuario.nombre', ' ', '$usuario.apellido'] },
          username: '$usuario.username',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
    return { data };
  }

  async comentariosPorFecha(rango: RangoFechas) {
    const match = this.buildDateFilter(rango);
    const data = await this.comentarioModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } },
    ]);
    return { data };
  }

  async comentariosPorPublicacion(rango: RangoFechas) {
    const match = this.buildDateFilter(rango);
    const data = await this.comentarioModel.aggregate([
      { $match: match },
      { $group: { _id: '$publicacionId', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: { path: '$publicacion', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
    return { data };
  }
}
