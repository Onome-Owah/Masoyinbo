import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Game_Room } from './game.entity';
import { Game_Player } from './game-player.entity';

@Entity('teams')
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => TeamStats, (stats) => stats.team)
  stats: TeamStats[];

  @Column()
  name: string;

  @ManyToOne(() => Game_Room, (game) => game.teams)
  game: Game_Room;

  @OneToMany(() => Game_Player, (user) => user.team)
  players: Game_Player[];

  @ManyToOne(() => Game_Player, { nullable: true })
  teamLeader: Game_Player;
}
