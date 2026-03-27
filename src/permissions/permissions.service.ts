import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Permission "${dto.name}" already exists`,
      );
    }
    const permission = this.permissionRepository.create(dto);
    return this.permissionRepository.save(permission);
  }

  /**
   * Inserts permissions that do not exist yet; silently skips duplicates.
   * Designed to be called from a module's OnModuleInit for auto-seeding.
   */
  async bulkUpsert(dtos: CreatePermissionDto[]): Promise<Permission[]> {
    if (dtos.length === 0) return [];
    await this.permissionRepository
      .createQueryBuilder()
      .insert()
      .into(Permission)
      .values(dtos)
      .orIgnore()
      .execute();
    return this.permissionRepository.find({
      where: { name: In(dtos.map((d) => d.name)) },
      order: { name: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.permissionRepository.delete(id);
  }
}
