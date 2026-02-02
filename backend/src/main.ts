import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);

  // ⚠️ CRITICAL: Validate required environment variables on startup
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

  // Set global prefix for all routes (optional - currently disabled)
  // app.setGlobalPrefix('api');

  // 1. Global Validation - Enables automatic input data checking using DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Enable CORS - Production-ready configuration for Docker and Azure deployment
  // CRITICAL: When credentials: true is used, origin cannot be a wildcard (*)
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  
  // Define all allowed origins for local Docker development and production
  const allowedOrigins = corsOrigin 
    ? corsOrigin.split(',').map(origin => origin.trim())
    : [
        'http://localhost',           // Docker frontend on port 80
        'http://localhost:80',        // Explicit port 80
        'http://localhost:5173',      // Vite dev server
        'http://localhost:5174',      // Vite alternative port
        'http://localhost:3000',      // Backend itself (for testing)
        'http://127.0.0.1',           // Localhost alternative
        'http://127.0.0.1:5173',      // Localhost alternative with port
        'http://127.0.0.1:3000',      // Localhost alternative backend
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin (Postman/Mobile/Server)');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log(`✅ CORS: Allowing request from: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ CORS: Blocked request from origin: ${origin}`);
        console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // CRITICAL: Allows cookies and Authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Accept', 
      'Authorization',
      'x-tenant-id',     // Custom header for multi-tenancy (lowercase)
      'X-Tenant-ID',     // Case variation support
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight requests for 24 hours
  });
  
  console.log('🔒 CORS: Enabled for specific origins:', allowedOrigins);

  // 3. Swagger Setup - Configures the API Documentation page
  const config = new DocumentBuilder()
    .setTitle('FMS SaaS Platform API')
    .setDescription('The API documentation for Facility Management & CMMS System')
    .setVersion('1.0')
    // Grouping our API endpoints by their modules
    .addTag('Auth')
    .addTag('Users')
    .addTag('Assets')
    .addTag('Work Orders')
    // This line adds the "Authorize" button and enables JWT in Swagger UI 🔐
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // This line creates the /api path for your documentation
  SwaggerModule.setup('api', app, document);

  // 4. Start the server - Docker and Azure App Service compatibility
  // CRITICAL FOR DOCKER: Listen on 0.0.0.0 to accept connections from any network interface
  // This is required for Docker containers to be accessible from the host machine
  const port = configService.get<number>('PORT') || 3000;
  const host = '0.0.0.0'; // DO NOT CHANGE - Required for Docker networking
  
  await app.listen(port, host);
  
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
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