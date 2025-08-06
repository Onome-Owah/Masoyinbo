import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Difficulty } from 'src/difficulty/entities/difficulty.entity';
import { catchErrors } from 'src/utils/catch-error';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Difficulty)
    private readonly difficultyRepository: Repository<Difficulty>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
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

  async get_all_modules(languageId: string) {
    return catchErrors(async () => {
      if (!languageId) {
        throw new BadRequestException('Language ID must be provided.');
      }

      const language = await this.languageRepository.findOne({
        where: { id: languageId },
        relations: ['language_modules'],
      });

      if (!language) throw new NotFoundException('Language not found');

      const difficulty = await this.difficultyRepository.find();
      const modules = language.language_modules;

      return {
        data: {
          difficulty,
          modules,
        },
      };
    });
  }
}
