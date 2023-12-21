import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import EncryptService from 'src/util/encryption';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  providers: [UserService, EncryptService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
