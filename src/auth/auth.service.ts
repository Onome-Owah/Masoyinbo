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
}
