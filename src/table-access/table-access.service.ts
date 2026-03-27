import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableAccess } from '../entities/table-access.entity';
import { UpsertTableAccessDto } from './dto/upsert-table-access.dto';
import { UpdateTableAccessDto } from './dto/update-table-access.dto';

@Injectable()
export class TableAccessService {
  constructor(
    @InjectRepository(TableAccess)
    private readonly tableAccessRepository: Repository<TableAccess>,
  ) {}

  findAll(): Promise<TableAccess[]> {
    return this.tableAccessRepository.find({
      relations: ['role'],
      order: { role_id: 'ASC', table_name: 'ASC' },
    });
  }

  findByRole(roleId: number): Promise<TableAccess[]> {
    return this.tableAccessRepository.find({
      where: { role_id: roleId },
      order: { table_name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TableAccess> {
    const record = await this.tableAccessRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!record) {
      throw new NotFoundException(`TableAccess record with ID ${id} not found`);
    }
    return record;
  }

  /**
   * Creates or fully replaces the access record for a (role_id, table_name) pair.
   */
  async upsert(dto: UpsertTableAccessDto): Promise<TableAccess> {
    const existing = await this.tableAccessRepository.findOne({
      where: { role_id: dto.role_id, table_name: dto.table_name },
    });

    if (existing) {
      Object.assign(existing, {
        can_create: dto.can_create ?? existing.can_create,
        can_read: dto.can_read ?? existing.can_read,
        can_update: dto.can_update ?? existing.can_update,
        can_delete: dto.can_delete ?? existing.can_delete,
      });
      return this.tableAccessRepository.save(existing);
    }

    const record = this.tableAccessRepository.create({
      role_id: dto.role_id,
      table_name: dto.table_name,
      can_create: dto.can_create ?? false,
      can_read: dto.can_read ?? false,
      can_update: dto.can_update ?? false,
      can_delete: dto.can_delete ?? false,
    });
    return this.tableAccessRepository.save(record);
  }

  /**
   * Partially updates CRUD flags on an existing record.
   */
  async update(id: number, dto: UpdateTableAccessDto): Promise<TableAccess> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.tableAccessRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.tableAccessRepository.delete(id);
  }
}
