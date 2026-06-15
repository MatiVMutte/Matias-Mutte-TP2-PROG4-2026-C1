import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './controllers/users.controller';
import { ProfileController } from './controllers/profile.controller';
import { UsersService } from './services/users.service';
import { AuthModule } from '../auth/auth.module';
import { SupabaseStorageService } from '../../shared/services/supabase-storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UsersController, ProfileController],
  providers: [UsersService, SupabaseStorageService],
  exports: [UsersService],
})
export class UsersModule {}
