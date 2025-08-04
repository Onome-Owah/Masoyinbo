import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';


@Entity()
export class Game_Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @OneToMany(() => TeamStats, (teamStats) => teamStats.game)
  teamStats: TeamStats[];

  @ManyToOne(() => Difficulty)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty: Difficulty;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @OneToMany(() => TeamEntity, (team) => team.game)
  teams: TeamEntity[];

  @OneToMany(() => Game_Player, (gamePlayer) => gamePlayer.game)
  players: Game_Player[];

  @Column({ default: false })
  team_mode: boolean;

  @Column({ default: false })
  is_started: boolean;

  @Column({ type: 'enum', enum: ['manual', 'automatic'], nullable: true })
  team_formation: 'manual' | 'automatic' | null;

  @Column({ unique: true })
  game_code: string;
}
