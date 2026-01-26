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
    const allowedOrigins = [
        'http://localhost',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3001',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ];
    if (corsOrigin) {
        const customOrigins = corsOrigin.split(',').map(origin => origin.trim());
        allowedOrigins.push(...customOrigins);
    }
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
                callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400,
    });
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
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📚 API Docs available at: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map