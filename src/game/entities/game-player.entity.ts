import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Game_Room } from 'src/game/entities/game.entity';

@Entity()
export class Game_Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game_Room, (game) => game.players)
  @JoinColumn({ name: 'game_id' })
  game: Game_Room;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TeamEntity, (team) => team.players, { nullable: true })
  team: TeamEntity;

  @Column({ default: false })
  is_leader: boolean;

  @Column({ default: false })
  is_game_master: boolean;
}
