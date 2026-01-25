import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);

  // 1. Global Validation - Enables automatic input data checking using DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Enable CORS - Configure for production deployment
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  
  // Build allowed origins list
  const allowedOrigins = [
    'http://localhost',        // Frontend on port 80 (Docker)
    'http://localhost:5173',   // Vite dev server (local development)
  ];
  
  // Add custom origins from environment variable
  if (corsOrigin) {
    const customOrigins = corsOrigin.split(',').map(origin => origin.trim());
    allowedOrigins.push(...customOrigins);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

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

  // 4. Start the server - Use PORT from environment or default to 3000
  // Listen on 0.0.0.0 to allow Docker container access
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api`);
}
bootstrap();