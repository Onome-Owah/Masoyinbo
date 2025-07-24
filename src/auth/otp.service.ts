import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SendMailClient } from 'zeptomail';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private client: SendMailClient;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.client = new SendMailClient({
      url: configService.get<string>('ZEPTO_URL'),
      token: configService.get<string>('ZEPTO_TOKEN'),
    });
  }

  async generateOtp(length = 6): Promise<string> {
    return crypto.randomInt(100000, 999999).toString();
  }

  async send_otp(email: string, otp: string) {
    try {
      await this.client.sendMail({
        from: {
          address: this.configService.get<string>('ZEPTO_FROM_EMAIL'),
          name: this.configService.get<string>('ZEPTO_FROM_NAME'),
        },
        to: [
          {
            email_address: {
              address: email,
              name: 'User',
            },
          },
        ],
        subject: 'Your OTP Code',
        htmlbody: `<div><b>Your OTP code is ${otp}. It will expire in 5 minutes.</b></div>`,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async send_password(email: string, password: string) {
    try {
      await this.client.sendMail({
        from: {
          address: this.configService.get<string>('ZEPTO_FROM_EMAIL'),
          name: this.configService.get<string>('ZEPTO_FROM_NAME'),
        },
        to: [
          {
            email_address: {
              address: email,
              name: 'User',
            },
          },
        ],
        subject: 'Your Temporary Password',

        htmlbody: `<div><b>Your temporary password is: ${password}. Please log in and change your password immediately.</b></div>`,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // async send_password_email(email: string, password: string) {
  //   try {
  //     await this.client.sendMail({
  //       from: {
  //         address: this.configService.get<string>('ZEPTO_FROM_EMAIL'),
  //         name: this.configService.get<string>('ZEPTO_FROM_NAME'),
  //       },
  //       to: [
  //         {
  //           email_address: {
  //             address: email,
  //             name: 'User',
  //           },
  //         },
  //       ],
  //       subject: 'Your Temporary Password',
  //       html: `<div>
  //                <p><b>Your temporary password is:</b> ${password}</p>
  //                <p>Please log in and change your password immediately.</p>
  //              </div>`,
  //     });
  //   } catch (error) {
  //     console.error('Error sending OTP email:', error);
  //     throw new Error('Failed to send OTP email');
  //   }
  // }

  async generate_secure_password() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+';

    const allChars = uppercase + lowercase + numbers + specialChars;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill remaining characters randomly
    for (let i = 4; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize character positions
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  async send_password_email1(email: string, password: string) {
    try {
      await this.client.sendMail({
        from: `${this.configService.get<string>('ZEPTO_FROM_NAME')} <${this.configService.get<string>('ZEPTO_FROM_EMAIL')}>`,
        // to: email,
        to: [
          {
            email_address: {
              address: email,
              name: 'User',
            },
          },
        ],

        subject: 'Your Temporary Password',
        html: `<div>
                 <p><b>Your temporary password is:</b> ${password}</p>
                 <p>Please log in and change your password immediately.</p>
               </div>`,
      });
    } catch (error) {
      console.error('Error sending password email:', error);
      throw new Error('Failed to send password email');
    }
  }

  async resend_otp(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      user.otp &&
      user.otp_expires_at &&
      Date.now() < user.otp_expires_at.getTime()
    ) {
      throw new BadRequestException(
        'Previous OTP is still valid. Please wait before requesting a new one.',
      );
    }

    const newOtp = await this.generateOtp();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);


    await this.userRepository.update(user.id, {
      otp: newOtp,
      otp_expires_at: otpExpiry,
    });

    await this.send_otp(email, newOtp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otp_expires_at) {
      throw new BadRequestException('No OTP found for this email');
    }

    if (Date.now() > user.otp_expires_at.getTime()) {
      user.otp = null;
      user.otp_expires_at = null;
      await this.userRepository.save(user);

      throw new UnauthorizedException('OTP has expired, request a new one');
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    user.otp = null;
    user.otp_expires_at = null;
    user.is_verified = true;
    await this.userRepository.save(user);

    return { success: true, message: 'OTP verified successfully' };
  }
}
