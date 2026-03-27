import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { Role } from '../entities/role.entity';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RBACGuard)
@Roles('admin:manage')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.remove(id);
  }

  /**
   * Adds permissions to a role (additive).
   * POST /admin/roles/:id/permissions
   */
  @Post(':id/permissions')
  assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ): Promise<Role> {
    return this.rolesService.assignPermissions(id, dto);
  }

  /**
   * Replaces all permissions on a role.
   * PUT /admin/roles/:id/permissions
   */
  @Put(':id/permissions')
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ): Promise<Role> {
    return this.rolesService.setPermissions(id, dto);
  }

  /**
   * Removes a single permission from a role.
   * DELETE /admin/roles/:id/permissions/:permId
   */
  @Delete(':id/permissions/:permId')
  @HttpCode(HttpStatus.OK)
  removePermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permId', ParseIntPipe) permId: number,
  ): Promise<Role> {
    return this.rolesService.removePermission(id, permId);
  }
}
