import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    // Check critical environment variables
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        jwtConfigured: !!jwtSecret,
        databaseConfigured: !!databaseUrl,
        nodeEnv: this.configService.get<string>('NODE_ENV') || 'development',
        port: this.configService.get<string>('PORT') || '3000',
      },
      warnings: [] as string[],
    };

    // Add warnings for missing config
    if (!jwtSecret) {
      health.status = 'degraded';
      health.warnings.push('JWT_SECRET is not configured - authentication will fail');
    }
    if (!databaseUrl) {
      health.status = 'degraded';
      health.warnings.push('DATABASE_URL is not configured - database operations will fail');
    }

    return health;
  }
}
