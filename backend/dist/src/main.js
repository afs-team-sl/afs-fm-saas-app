"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const corsOrigin = configService.get('CORS_ORIGIN');
    const allowedOrigins = corsOrigin
        ? corsOrigin.split(',').map(origin => origin.trim())
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
        ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Tenant-ID',
            'Accept',
            'Origin',
            'X-Requested-With',
        ],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
    });
    console.log('🔒 CORS: Enabled for specific origins:', allowedOrigins);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FMS SaaS Platform API')
        .setDescription('The API documentation for Facility Management & CMMS System')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Users')
        .addTag('Assets')
        .addTag('Work Orders')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = configService.get('PORT') || 3000;
    const host = '0.0.0.0';
    await app.listen(port, host);
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    console.log(`🚀 Server is running on: http://${host}:${port}`);
    console.log(`📚 API Docs available at: http://localhost:${port}/api`);
    console.log(`🌍 Environment: ${nodeEnv}`);
    console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map