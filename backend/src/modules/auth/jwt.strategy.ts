import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Request එකේ Header එකෙන් "Bearer <token>" විදියට ටෝකන් එක ගන්නවා
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'MY_SECRET_KEY_123', 
    });
  }

  async validate(payload: any) {
    // ටෝකන් එක හරියටම check වුණාම මේ return කරන ඩේටා ටික 
    // request.user කියන තැනට NestJS මගින් ඇතුළත් කරනවා.
    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      role: payload.role 
    };
  }
}