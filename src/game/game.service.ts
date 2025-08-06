import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      //Exclude data that are not needed
      const {
        password,
        lives,
        last_Life_Deduction,
        otp,
        otp_expires_at,
        refresh_token,
        total_correct_answers,
        total_questions_answered,
        total_time_spent,
        total_coins_earned,
        ...others
      } = user;

      return {
        message: 'User fetched successfully',
        data: others,
      };
    } catch (error) {
      this.logger.error('Error fetching user:', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching the user',
      );
    }
  }
}
