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
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Complete_onboarding_dto, Signup_dto } from './dto/signup.dto';

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
}
