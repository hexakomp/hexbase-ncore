import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RBACGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { BulkUpsertPermissionsDto } from './dto/bulk-upsert-permissions.dto';
import { Permission } from '../entities/permission.entity';

@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, RBACGuard)
@Roles('admin:manage')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionsService.create(dto);
  }

  /**
   * Bulk-insert permissions, skipping duplicates.
   * Useful for seeding a business module's permissions.
   */
  @Post('bulk')
  bulkUpsert(@Body() dto: BulkUpsertPermissionsDto): Promise<Permission[]> {
    return this.permissionsService.bulkUpsert(dto.permissions);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
