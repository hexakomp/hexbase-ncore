// ─── Core Module ────────────────────────────────────────────────────────────
export { HexbaseNCoreModule } from './core/hexbase-ncore.module';

// ─── Auth ────────────────────────────────────────────────────────────────────
export { AuthModule } from './auth/auth.module';
export { AuthService } from './auth/auth.service';
export { JwtAuthGuard } from './auth/guards/jwt.guard';
export { JwtStrategy } from './auth/strategies/jwt.strategy';
export { LoginDto } from './auth/dto/login.dto';

// ─── Users ───────────────────────────────────────────────────────────────────
export { UsersModule } from './users/users.module';
export { UsersService } from './users/users.service';
export { CreateUserDto } from './users/dto/create-user.dto';
export { UpdateUserDto } from './users/dto/update-user.dto';

// ─── RBAC ────────────────────────────────────────────────────────────────────
export { RBACModule } from './rbac/rbac.module';
export { RBACGuard } from './rbac/rbac.guard';
export { Roles } from './rbac/decorators/roles.decorator';

// ─── Table Access ─────────────────────────────────────────────────────────────
export { TableAccessModule } from './table-access/table-access.module';
export { TableAccessGuard } from './table-access/table-access.guard';
export { TableAccess } from './table-access/decorators/table-access.decorator';

// ─── Database ─────────────────────────────────────────────────────────────────
export { DatabaseModule } from './database/database.module';

// ─── Entities ─────────────────────────────────────────────────────────────────
export { User } from './entities/user.entity';
export { Role } from './entities/role.entity';
export { Permission } from './entities/permission.entity';
export { TableAccess as TableAccessEntity } from './entities/table-access.entity';

// ─── Common ───────────────────────────────────────────────────────────────────
export { CurrentUser } from './common/decorators/current-user.decorator';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export type {
  HexbaseNCoreOptions,
  JwtPayload,
  RequestWithUser,
} from './interfaces';

// ─── Constants ────────────────────────────────────────────────────────────────
export {
  HEXBASE_NCORE_OPTIONS,
  ROLES_KEY,
  TABLE_ACCESS_KEY,
  JWT_STRATEGY,
  UserStatus,
  HttpMethod,
} from './constants';
