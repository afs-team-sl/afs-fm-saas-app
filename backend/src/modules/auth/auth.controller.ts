// src/modules/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JoinOrganizationDto } from './dto/join-organization.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Public registration endpoint to create a new Tenant and Admin User.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new company and admin user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful. Tenant and Admin user created.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict. User with this email already exists.' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login endpoint to authenticate users and return a JWT token.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login to get JWT access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful. JWT token returned.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid email or password.' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error. Check server configuration.' 
  })
  async signIn(@Body() loginDto: LoginDto) {
    try {
      // We pass email and password from the DTO to the auth service
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      // Log the error for debugging
      console.error('🚨 Login endpoint error:', error.message);
      throw error;
    }
  }

  /**
   * Join Organization endpoint to allow users to join using a join code.
   */
  @Post('join')
  @ApiOperation({ summary: 'Join an existing organization using a join code' })
  @ApiResponse({ 
    status: 201, 
    description: 'Successfully joined organization. User created and JWT returned.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Organization not found. Invalid join code.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict. User with this email already exists.' 
  })
  async joinOrganization(@Body() joinDto: JoinOrganizationDto) {
    return this.authService.joinOrganization(joinDto);
  }
}