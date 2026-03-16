import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// import type breaks the circular import cycle at the language-server level.
// TypeORM resolves 'Role' to the class at runtime via its entity registry.
import type { Role } from './role.entity';
import { UserStatus } from '../constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ nullable: true, type: 'int' })
  role_id: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ManyToOne('Role', (role: Role) => role.users, { nullable: true, eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
