import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  section_name: string;

  @Column()
  colour: string;

  @Column({ default: true })
  is_visible: boolean;

  @Column()
  image: string;

  @Column({ nullable: true })
  yoruba_section_name: string;

  @OneToMany(() => Game_Room, (game) => game.section)
  games: Game_Room[];

  @ManyToOne(() => Admin_Entity, (admin) => admin.section, {
    onDelete: 'CASCADE',
  })
  admin: Admin_Entity;

  @OneToMany(() => Question, (question) => question.section, { cascade: true })
  questions: Question[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
