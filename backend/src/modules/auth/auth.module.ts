import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Use ConfigService to load JWT_SECRET from environment variables
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Non-null assertion (!) ensures JWT_SECRET is defined
        // This is safe because the app should not start without this critical value
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          // Cast to any to satisfy JwtModuleOptions type requirements
          // The value is a valid time string ('1d', '7d', etc.) which JWT library accepts
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}