import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complete_onboarding_dto, Signup_dto } from './dto/signup.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup(dto: Signup_dto) {
    const { email, password, reenter_password } = dto;

    const emailExist = await this.userRepository.findOne({ where: { email } });

    if (emailExist) {
      throw new BadRequestException('Email already exists');
    }

    if (password !== reenter_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //const otp = await this.otpService.generateOtp();
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      is_completed: false,
      //otp,
      otp_expires_at: new Date(Date.now() + 1 * 60 * 1000),
    });

    user.lives = 3;

    await this.userRepository.save(user);

    //await this.otpService.send_otp(email, otp);

    return {
      message: 'Step 1 completed successfully. OTP sent to your email.',
      email,
    };
  }

  async complete_onboarding(dto: Complete_onboarding_dto) {
    const { email, username } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if the username is already taken by another user
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser && existingUser.id !== user.id) {
      throw new BadRequestException('Username is already in use');
    }

    user.username = username;
    user.gender = dto.gender;
    user.is_completed = true;

    await this.userRepository.save(user);

    return {
      message: 'Signup completed successfully.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        isCompleted: user.is_completed,
      },
    };
  }

  async login(dto: Login_dto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password incorrect');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      user_type: user.user_type,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      message: 'Login successful',
      data: {
        access_token,
        id: user.id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        is_completed: user.is_completed,
        is_survey_completed: user.is_survey_completed,
      },
    };
  }
}
