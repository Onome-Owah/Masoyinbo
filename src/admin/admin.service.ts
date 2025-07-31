import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Create_Admin_Dto } from './dto/create-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Admin_Entity } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin_Entity)
    private readonly adminRepository: Repository<Admin_Entity>,
    private readonly jwtService: JwtService,
  ) {}
  //Invite an admin via email and onboard them
  async onboardAdmin(createAdminDto: Create_Admin_Dto) {
    try {
      const { email, first_name, last_name, role } = createAdminDto;
      const emailExist = await this.adminRepository.findOne({
        where: { email },
      });

      if (emailExist) {
        throw new ConflictException('Admin with this email already exists');
      }

      // Fetch the Admin_Role entity by ID
      // const adminRole = await this.adminRoleRepository.findOne({
      //   where: { id: role },
      // });
      // if (!adminRole) {
      //   throw new NotFoundException('Admin role not found');
      // }

      //generate a one time password and send it to the admin email
      // const password = await this.otpservice.generate_secure_password();
      //const hashedPassword = await bcrypt.hash(password, 10);
      // await this.otpservice.send_password(email, password);

      // const newAdmin = this.adminRepository.create({
      //   email: email.toLowerCase().trim(),
      //   role: adminRole,
      //   password: hashedPassword,
      // });

      // await this.adminRepository.save(newAdmin);

      return {
        success: true,
        message: 'Please check your email for your password',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Failed to onboard admin');
    }
  }

  async login_admin(email: string, password: string) {
    try {
      const user = await this.adminRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Password incorrect');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        user_type: user.user_type,
      };

      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '45m',
      });

      const reset_access_token = this.jwtService.sign(
        { ...payload, purpose: 'reset' },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '10m',
        },
      );

      return {
        success: true,
        message: 'Login successful',
        access_token,
        reset_access_token,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error(error);

      throw new InternalServerErrorException('Failed to log in admin');
    }
  }

  async update_admin_password(
    email: string,
    password: string,
    confirm_password: string,
  ) {
    try {
      const user = await this.adminRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (password !== confirm_password) {
        throw new BadRequestException('Passwords do not match');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      await this.adminRepository.save(user);

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error(error);
      throw new InternalServerErrorException('Failed to update password');
    }
  }
}
