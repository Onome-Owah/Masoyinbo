import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Complete_onboarding_dto, Signup_dto } from './dto/signup.dto';
import { Login_dto } from './dto/login.dto';
import { Forget_password_dto } from './dto/forget-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: Signup_dto) {
    return this.authService.signup(dto);
  }

  @Post('complete-onboarding')
  async complete_onboarding(@Body() dto: Complete_onboarding_dto) {
    return this.authService.complete_onboarding(dto);
  }

  @Post('login')
  async login(@Body() dto: Login_dto) {
    return this.authService.login(dto);
  }

  @Post('forget-password')
  async forget_password(@Body() dto: Forget_password_dto) {
    return this.authService.forget_password(dto.email);
  }
}
