import { Game_Room } from 'src/game/entities/game.entity';
import { Question } from '../../question/entities/question.entity';
import { Section } from '../../section/entities/section.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DifficultyType {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  RANDOM = 'RANDOM',
}

@Entity()
export class Difficulty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DifficultyType,
  })
  type: DifficultyType;

  @OneToMany(() => Game_Room, (game) => game.difficulty)
  games: Game_Room[];

  @Column()
  name: string;

  @OneToMany(() => Question, (question) => question.difficulty)
  questions: Question[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
