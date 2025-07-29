import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Complete_onboarding_dto,
  Signup_dto,
  UpdateUserDto,
} from './dto/signup.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Login_dto } from './dto/login.dto';
import { OtpService } from './otp.service';
import { SurveyResponseDto } from './dto/survey.dto';
import { S3Service } from 'src/utils/s3service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly s3Service: S3Service,
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

  async logout(userId: string) {
    await this.userRepository.update(userId, { refresh_token: undefined });
    return { message: 'Logged out successfully' };
  }

  async forget_password(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.otpService.generateOtp();

    await this.otpService.send_otp(email, otp);
    user.otp = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'OTP sent to your email',
    };
  }

  async user_survey(surveyResponseDto: SurveyResponseDto) {
    const {
      email,
      survey_age,
      survey_commitment,
      survey_reason,
      survey_usage,
    } = surveyResponseDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.survey_reason = survey_reason ?? [];
    user.survey_age = survey_age ?? '';
    user.survey_commitment = survey_commitment ?? '';
    user.survey_usage = survey_usage ?? [];
    user.is_survey_completed = true;

    await this.userRepository.save(user);

    return { message: 'Survey response updated successfully' };
  }

  async softDeleteUser(userId: string): Promise<void> {
    await this.userRepository.softDelete(userId);
  }

  async reset_password(
    email: string,
    password: string,
    reenter_password: string,
  ) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (password !== reenter_password) {
      throw new BadRequestException('Passwords do not match');
    }

    user.password = await bcrypt.hash(password, 10);
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  async fileUploads(image: Express.Multer.File) {
    try {
      if (!image) {
        return {
          success: false,
          message: 'No image file provided',
          files: [],
        };
      }

      if (!image.mimetype.startsWith('image/')) {
        throw new BadRequestException('Invalid file type. Expected an image.');
      }

      const imageUrl = await this.s3Service.uploadToS3(image, 'images');
      //const uploadedFiles = [{ type: FileType.IMAGE, url: imageUrl }];

      return {
        success: true,
        message: 'Files uploaded successfully',
        //files: uploadedFiles,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException(
        `File upload error: ${error.message}`,
      );
    }
  }

  async updateUserDetails(userId: string, dto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (dto.password || dto.reenter_password) {
        if (dto.password !== dto.reenter_password) {
          throw new BadRequestException('Passwords do not match');
        }
        user.password = await bcrypt.hash(dto.password, 10);
      }

      // Update only the provided fields
      if (dto.email) user.email = dto.email;
      if (dto.username) user.username = dto.username;
      if (dto.gender) user.gender = dto.gender;
      if (dto.image) user.image = dto.image;

      await this.userRepository.save(user);

      const {
        password,
        otp,
        otp_expires_at,
        refresh_token,
        lives,
        last_Life_Deduction,
        total_coins_earned,
        total_correct_answers,
        total_questions_answered,
        total_time_spent,
        is_payment,
        deleted_at,
        created_at,
        ...rest
      } = user;

      return {
        success: true,
        message: 'User updated successfully',
        data: { ...rest },
      };
    } catch (error) {
      console.error('Error updating user:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the user',
      );
    }
  }
}
