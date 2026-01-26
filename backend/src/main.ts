import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);

  // Set global prefix for all routes (optional - currently disabled)
  // app.setGlobalPrefix('api');

  // 1. Global Validation - Enables automatic input data checking using DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Enable CORS - Production-ready configuration for Azure deployment
  // CRITICAL: When credentials: true is used, origin cannot be a wildcard (*)
  // We use ConfigService to get allowed origins from environment variables
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  
  // Parse comma-separated origins from environment variable
  const allowedOrigins = corsOrigin 
    ? corsOrigin.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
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

  // 4. Start the server - Azure App Service compatibility
  // Azure App Service sets the PORT environment variable dynamically
  // Listen on 0.0.0.0 to accept connections from any network interface
  const port = configService.get<number>('PORT') || 3000;
  const host = '0.0.0.0'; // Required for Azure App Service and Docker
  
  await app.listen(port, host);
  
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  console.log(`🚀 Server is running on: http://${host}:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api`);
  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();