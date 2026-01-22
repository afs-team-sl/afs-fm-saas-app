import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Non-null assertion (!) ensures JWT_SECRET is defined
      // This is required because passport-jwt expects a string, not string | undefined
      // The app will fail to start if JWT_SECRET is missing, which is the desired behavior
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    // Decode and validate JWT payload
    // This data is automatically attached to request.user by NestJS
    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      role: payload.role 
    };
  }
}