import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('table_access')
@Index(['role_id', 'table_name'], { unique: true })
export class TableAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  role_id: number;

  @Column({ length: 100 })
  table_name: string;

  @Column({ default: false })
  can_create: boolean;

  @Column({ default: false })
  can_read: boolean;

  @Column({ default: false })
  can_update: boolean;

  @Column({ default: false })
  can_delete: boolean;

  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
