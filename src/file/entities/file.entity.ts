import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

export enum FileType {
  IMAGE = 'image',
  VOICE = 'voice',
  VIDEO = 'video',
}

@Entity('file')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  path: string;

  @Column({
    type: 'enum',
    enum: FileType,
  })
  type: FileType;
}
