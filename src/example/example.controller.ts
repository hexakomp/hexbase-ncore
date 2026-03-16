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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RBACGuard } from '../rbac/rbac.guard';
import { TableAccessGuard } from '../table-access/table-access.guard';
import { Roles } from '../rbac/decorators/roles.decorator';
import { TableAccess } from '../table-access/decorators/table-access.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../interfaces';

/**
 * Example controller demonstrating the three-layer security model.
 *
 * Guard execution order:
 *   1. JwtAuthGuard  — validates the Bearer token
 *   2. RBACGuard     — checks the user's role permissions
 *   3. TableAccessGuard — checks row-level CRUD access on the table
 */
@Controller('products')
@UseGuards(JwtAuthGuard, RBACGuard, TableAccessGuard)
export class ExampleController {
  @Get()
  @Roles('product:read')
  @TableAccess('products')
  findAll(@CurrentUser() user: JwtPayload): Record<string, unknown> {
    return {
      message: 'List of products',
      requestedBy: user.email,
    };
  }

  @Post()
  @Roles('product:create')
  @TableAccess('products')
  create(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ): Record<string, unknown> {
    return {
      message: 'Product created',
      data: body,
      requestedBy: user.email,
    };
  }

  @Patch(':id')
  @Roles('product:update')
  @TableAccess('products')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ): Record<string, unknown> {
    return {
      message: `Product ${id} updated`,
      data: body,
      requestedBy: user.email,
    };
  }

  @Delete(':id')
  @Roles('product:delete')
  @TableAccess('products')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Record<string, unknown> {
    return {
      message: `Product ${id} deleted`,
      requestedBy: user.email,
    };
  }
}
