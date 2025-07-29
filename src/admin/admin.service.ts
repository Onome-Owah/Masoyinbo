import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Create_Admin_Dto } from './dto/create-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Admin_Entity } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin_Entity)
    private readonly adminRepository: Repository<Admin_Entity>,
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
}
