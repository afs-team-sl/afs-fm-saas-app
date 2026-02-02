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
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !configService.get(varName));
    if (missingVars.length > 0) {
        console.error('');
        console.error('╔═══════════════════════════════════════════════════════════════════╗');
        console.error('║  ❌ FATAL ERROR: Missing Required Environment Variables          ║');
        console.error('╚═══════════════════════════════════════════════════════════════════╝');
        console.error('');
        console.error('The following environment variables are not set:');
        missingVars.forEach(varName => {
            console.error(`  ❌ ${varName}`);
        });
        console.error('');
        console.error('Please configure these in your .env file (local) or');
        console.error('Azure App Service Configuration → Application Settings (production)');
        console.error('');
        console.error('To generate a secure JWT_SECRET, run:');
        console.error('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        console.error('');
        throw new Error('Missing required environment variables. Server cannot start.');
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const corsOrigin = configService.get('CORS_ORIGIN');
    const allowedOrigins = corsOrigin
        ? corsOrigin.split(',').map(origin => origin.trim())
        : [
            'http://localhost',
            'http://localhost:80',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
        ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                console.log('✅ CORS: Allowing request with no origin (Postman/Mobile/Server)');
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) !== -1) {
                console.log(`✅ CORS: Allowing request from: ${origin}`);
                callback(null, true);
            }
            else {
                console.error(`❌ CORS: Blocked request from origin: ${origin}`);
                console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'x-tenant-id',
            'X-Tenant-ID',
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
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  🚀  AFS NEXUS - FACILITY MANAGEMENT SYSTEM                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Server listening on:     http://${host}:${port}`);
    console.log(`📚 API Documentation:       http://localhost:${port}/api`);
    console.log(`🌍 Environment:             ${nodeEnv}`);
    console.log(`🔒 CORS Enabled for:        ${allowedOrigins.length} origins`);
    console.log('');
    console.log('✅ Server is ready to accept connections!');
    console.log('');
}
bootstrap();
//# sourceMappingURL=main.js.map