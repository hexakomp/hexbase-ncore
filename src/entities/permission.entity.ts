import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Represents a single permission in the format `module:action`.
 *
 * Examples: `product:create`, `product:update`, `customer:delete`
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The permission name in the `module:action` format.
   * This value is checked by RBACGuard.
   */
  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description: string;
}
