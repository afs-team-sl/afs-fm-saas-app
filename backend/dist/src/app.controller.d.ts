import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private readonly appService;
    private readonly configService;
    constructor(appService: AppService, configService: ConfigService);
    getHello(): string;
    health(): {
        status: string;
        timestamp: string;
        config: {
            jwtConfigured: boolean;
            databaseConfigured: boolean;
            nodeEnv: string;
            port: string;
        };
        warnings: string[];
    };
}
