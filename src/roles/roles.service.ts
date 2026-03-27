import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }
    const role = this.roleRepository.create({ ...dto, permissions: [] });
    return this.roleRepository.save(role);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (dto.name && dto.name !== role.name) {
      const conflict = await this.roleRepository.findOne({
        where: { name: dto.name },
      });
      if (conflict) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
    }
    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }

  /**
   * Assigns additional permissions to a role (additive — does not remove existing ones).
   */
  async assignPermissions(
    id: number,
    dto: AssignPermissionsDto,
  ): Promise<Role> {
    const role = await this.findOne(id);
    const newPermissions = await this.permissionRepository.find({
      where: { id: In(dto.permissionIds) },
    });

    const existingIds = new Set(role.permissions.map((p) => p.id));
    const toAdd = newPermissions.filter((p) => !existingIds.has(p.id));
    role.permissions = [...role.permissions, ...toAdd];
    return this.roleRepository.save(role);
  }

  /**
   * Removes a single permission from a role.
   */
  async removePermission(roleId: number, permissionId: number): Promise<Role> {
    const role = await this.findOne(roleId);
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    return this.roleRepository.save(role);
  }

  /**
   * Replaces all permissions on a role with the provided set.
   */
  async setPermissions(id: number, dto: AssignPermissionsDto): Promise<Role> {
    const role = await this.findOne(id);
    role.permissions = await this.permissionRepository.find({
      where: { id: In(dto.permissionIds) },
    });
    return this.roleRepository.save(role);
  }
}
