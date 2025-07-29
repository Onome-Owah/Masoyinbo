
import { UserType } from 'src/user/types/user-type';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
 
} from 'typeorm';


@Entity('admin')
export class Admin_Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, default: null })
  first_name: string;

  @Column({ unique: true, default: null })
  last_name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.SUPERADMIN })
  user_type: UserType;

  @Column({ nullable: true })
  otp: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expires_at: Date;

  @Column({ default: false })
  is_verified: boolean;

//   @OneToMany(() => File, (file) => file.admin)
//   files: File[];



  @Column({ type: 'jsonb', default: {} })
  permissions: {
    dashboard?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    users?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    questions?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    learn?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    role_mng?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    administrators?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    activity_log?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    reports?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
    settings?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      approve?: boolean;
      reject?: boolean;
      delete?: boolean;
    };
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date;
}
