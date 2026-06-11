import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from '../schemas/publicacion.schema';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { ListPublicacionesDto } from '../dto/list-publicaciones.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async create(
    dto: CreatePublicacionDto,
    imagenUrl: string,
    autorId: string,
  ): Promise<PublicacionDocument> {
    return this.publicacionModel.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagenUrl,
      autor: new Types.ObjectId(autorId),
    });
  }

  async findAll(query: ListPublicacionesDto) {
    const { ordenar = 'fecha', userId, offset = 0, limit = 10 } = query;

    const filter: Record<string, unknown> = { activo: true };
    if (userId) {
      filter['autor'] = new Types.ObjectId(userId);
    }

    const sortField = ordenar === 'likes' ? 'likesCount' : 'createdAt';

    const publicaciones = await this.publicacionModel
      .aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { [sortField]: -1 } },
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
            titulo: 1,
            mensaje: 1,
            imagenUrl: 1,
            activo: 1,
            likes: 1,
            likesCount: 1,
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

    const total = await this.publicacionModel.countDocuments(filter);
    return { publicaciones, total, offset: Number(offset), limit: Number(limit) };
  }

  async delete(id: string, userId: string, perfil: string): Promise<void> {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const isOwner = pub.autor.toString() === userId;
    const isAdmin = perfil === 'administrador';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación.');
    }

    pub.activo = false;
    await pub.save();
  }

  async like(id: string, userId: string): Promise<{ likes: number }> {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const alreadyLiked = pub.likes.some(l => l.toString() === userId);
    if (alreadyLiked) {
      throw new ConflictException('Ya le diste me gusta a esta publicación.');
    }

    pub.likes.push(new Types.ObjectId(userId));
    await pub.save();
    return { likes: pub.likes.length };
  }

  async unlike(id: string, userId: string): Promise<{ likes: number }> {
    const pub = await this.publicacionModel.findById(id);
    if (!pub || !pub.activo) throw new NotFoundException('Publicación no encontrada.');

    const alreadyLiked = pub.likes.some(l => l.toString() === userId);
    if (!alreadyLiked) {
      throw new BadRequestException('No le habías dado me gusta a esta publicación.');
    }

    pub.likes = pub.likes.filter(l => l.toString() !== userId) as Types.ObjectId[];
    await pub.save();
    return { likes: pub.likes.length };
  }
}
