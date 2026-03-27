import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RBACGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { TableAccessService } from './table-access.service';
import { UpsertTableAccessDto } from './dto/upsert-table-access.dto';
import { UpdateTableAccessDto } from './dto/update-table-access.dto';
import { TableAccess } from '../entities/table-access.entity';

@Controller('admin/table-access')
@UseGuards(JwtAuthGuard, RBACGuard)
@Roles('admin:manage')
export class TableAccessController {
  constructor(private readonly tableAccessService: TableAccessService) {}

  /**
   * GET /admin/table-access          — all records
   * GET /admin/table-access?roleId=1 — filtered by role
   */
  @Get()
  findAll(
    @Query('roleId', new ParseIntPipe({ optional: true })) roleId?: number,
  ): Promise<TableAccess[]> {
    if (roleId !== undefined) {
      return this.tableAccessService.findByRole(roleId);
    }
    return this.tableAccessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TableAccess> {
    return this.tableAccessService.findOne(id);
  }

  /**
   * POST /admin/table-access
   * Creates or updates the CRUD flags for a (role_id, table_name) pair.
   */
  @Post()
  upsert(@Body() dto: UpsertTableAccessDto): Promise<TableAccess> {
    return this.tableAccessService.upsert(dto);
  }

  /**
   * PATCH /admin/table-access/:id
   * Partially updates CRUD flags on an existing record.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTableAccessDto,
  ): Promise<TableAccess> {
    return this.tableAccessService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tableAccessService.remove(id);
  }
}
