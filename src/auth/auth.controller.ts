import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('validate')
  validate(@Req() req) {
    return {
      status: true,
      message: 'Token válido',
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        uid: req.user.uid,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        email: req.user.email,
      },
    };
  }
}
