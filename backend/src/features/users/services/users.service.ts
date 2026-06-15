import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    const users = await this.userModel.find().select('-password').sort({ createdAt: -1 }).lean();
    return { users, total: users.length };
  }

  async create(dto: CreateUserDto, avatarUrl: string) {
    const existingEmail = await this.userModel.findOne({ correo: dto.correo.toLowerCase() });
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const existingUsername = await this.userModel.findOne({ username: dto.username });
    if (existingUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await this.userModel.create({
      ...dto,
      correo: dto.correo.toLowerCase(),
      password: hashedPassword,
      avatarUrl,
      perfil: dto.perfil ?? 'usuario',
    });

    const userObj = created.toObject();
    const { password: _, ...result } = userObj;
    return { user: result };
  }

  async updateProfile(
    id: string,
    data: { nombre?: string; apellido?: string; descripcion?: string; fechaNacimiento?: string },
    avatarUrl?: string,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    if (data.nombre !== undefined) user.nombre = data.nombre;
    if (data.apellido !== undefined) user.apellido = data.apellido;
    if (data.descripcion !== undefined) user.descripcion = data.descripcion;
    if (data.fechaNacimiento !== undefined) user.fechaNacimiento = data.fechaNacimiento;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    const userObj = user.toObject();
    const { password: _, ...result } = userObj;
    return { user: result };
  }

  async deshabilitar(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    user.activo = false;
    await user.save();
    const userObj = user.toObject();
    const { password: _, ...result } = userObj;
    return { user: result };
  }

  async habilitar(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    user.activo = true;
    await user.save();
    const userObj = user.toObject();
    const { password: _, ...result } = userObj;
    return { user: result };
  }
}
