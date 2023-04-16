import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleOauthGuard } from './guards/google-oauth.guard';

@ApiTags('Auth')
@Controller('auth/google')
export class AuthController {
  // constructor(private authService: AuthService) {}

  @Get('login')
  @UseGuards(GoogleOauthGuard)
  async handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('callback')
  @UseGuards(GoogleOauthGuard)
  async handleRedirect() {
    return { msg: 'OK' };
  }
}
