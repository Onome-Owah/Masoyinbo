import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserType } from '../types/user-type';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ default: false })
  is_completed: boolean;

//   @OneToMany(() => Game_Room, (game) => game.created_by)
//   created_games: Game_Room[];

  //@OneToMany(() => UserStreak, (streak) => streak.user)
  //userStreak: UserStreak;

  @Column({ nullable: true })
  gender?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expires_at: Date;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  user_type: UserType;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_survey_completed: boolean;

  @Column({ default: false })
  is_payment: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  survey_reason: string[];

  @Column({ type: 'text', array: true, nullable: true })
  survey_usage: string[];

  @Column({ nullable: true })
  survey_commitment: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'timestamp', nullable: true })
  last_Life_Deduction?: Date;

  @Column({ type: 'int', default: 0 })
  total_time_spent: number;

  @Column({ type: 'int', default: 0 })
  total_questions_answered: number;

  @Column({ type: 'int', default: 0 })
  total_coins_earned: number;

  @Column({ type: 'int', default: 0 })
  total_coins: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  total_correct_answers: number;

  @Column({ type: 'text', nullable: true })
  survey_age: string;

  @Column({ type: 'int', default: 5 })
  lives: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
