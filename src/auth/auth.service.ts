import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signup_dto } from './dto/signup.dto';
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

}
