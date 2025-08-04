import { Admin_Entity } from 'src/admin/entities/admin.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import { File } from 'src/file/entities/file.entity';
import { Section } from 'src/section/entities/section.entity';


@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column({ nullable: true })
  translate_question: string;

  @Column({ nullable: true })
  suffix: string;

  @Column({ nullable: true })
  audio_path?: string;

  @Column({ nullable: true })
  image_path?: string;

  @Column({ nullable: true })
  time_limit?: number;

  @Column({ default: false })
  shuffle_answers: boolean;

  @Column({ default: false })
  is_visible: boolean;

  @ManyToOne(() => Section, (section) => section.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ type: 'jsonb', nullable: true })
  options: string[];

  @Column({ type: 'jsonb', nullable: true })
  correctAnswer?: string;

  @ManyToOne(() => Difficulty, (difficulty) => difficulty.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'difficulty_id' })
  difficulty: Difficulty;

  // @Column('jsonb')
  // answer: {
  //   format: 'audio' | 'multi-choice' | 'text';
  //   answer: string | { [key: string]: string };
  // };

  @Column('jsonb')
  answer: {
    format: 'audio' | 'multi-choice' | 'text';
    answer: string | { [key: string]: string };
  }[];

  @ManyToOne(() => Admin_Entity, (admin) => admin.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin_Entity;

  // @OneToMany(() => Game_Question, (gameQuestion) => gameQuestion.question)
  // gameQuestions: Game_Question[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date;
}
