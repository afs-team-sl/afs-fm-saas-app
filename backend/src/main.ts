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

  // 2. Enable CORS - Allow all origins for Docker compatibility
  // CRITICAL: This configuration allows requests from any origin
  // which is essential for Docker container-to-container communication
  app.enableCors({
    origin: true, // Allow all origins
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
  });
  
  console.log('🔓 CORS: Enabled for all origins');

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

  // 4. Start the server - Listen on 0.0.0.0:3000 for Docker compatibility
  // 0.0.0.0 allows the container to accept connections from any network interface
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server is running on: http://0.0.0.0:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api`);
  console.log(`🐳 Docker: Accessible from other containers on port ${port}`);
}
bootstrap();