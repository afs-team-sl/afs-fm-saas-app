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
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        
        // Critical validation: JWT_SECRET must be defined
        if (!jwtSecret) {
          throw new Error(
            '❌ FATAL ERROR: JWT_SECRET environment variable is not defined!\n' +
            'Please set JWT_SECRET in your .env file or Azure App Service configuration.\n' +
            'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
          );
        }

        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1d';

        console.log('✅ JWT Module initialized successfully');
        console.log(`   Secret: ${jwtSecret.substring(0, 10)}... (${jwtSecret.length} chars)`);
        console.log(`   Expires In: ${expiresIn}`);

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}