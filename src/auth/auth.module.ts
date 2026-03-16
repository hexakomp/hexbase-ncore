import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexbaseNCoreOptions } from '../interfaces';
import { HEXBASE_NCORE_OPTIONS } from '../constants';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';

@Module({})
export class AuthModule {
  static forRoot(options: HexbaseNCoreOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: { expiresIn: '24h' },
        }),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: HEXBASE_NCORE_OPTIONS,
          useValue: options,
        },
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
      ],
      exports: [AuthService, JwtAuthGuard, JwtStrategy, JwtModule, PassportModule, TypeOrmModule],
    };
  }
}
