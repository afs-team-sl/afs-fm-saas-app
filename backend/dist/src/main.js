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
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, x-tenant-id, X-Tenant-ID, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    });
    console.log('🔒 CORS: Manual middleware active - all origins allowed with credentials');
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
    console.log(`🔒 CORS:                    ✅ Manual middleware - all origins allowed`);
    console.log('');
    console.log('✅ Server is ready to accept connections!');
    console.log('');
}
bootstrap();
//# sourceMappingURL=main.js.map