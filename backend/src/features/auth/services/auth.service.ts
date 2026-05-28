import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async register(dto: RegisterDto, avatarUrl: string): Promise<Omit<UserDocument, 'password'>> {
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

    const user = created.toObject();
    const { password: _, ...result } = user;
    return result as Omit<UserDocument, 'password'>;
  }

  async login(dto: LoginDto): Promise<Omit<UserDocument, 'password'>> {
    const user = await this.userModel.findOne({
      $or: [
        { correo: dto.identifier.toLowerCase() },
        { username: dto.identifier },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const userObj = user.toObject();
    const { password: _, ...result } = userObj;
    return result as Omit<UserDocument, 'password'>;
  }
}
