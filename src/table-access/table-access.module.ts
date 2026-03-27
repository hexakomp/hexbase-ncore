import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableAccess } from '../entities/table-access.entity';
import { TableAccessGuard } from './table-access.guard';
import { TableAccessService } from './table-access.service';
import { TableAccessController } from './table-access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TableAccess])],
  controllers: [TableAccessController],
  providers: [TableAccessGuard, TableAccessService],
  exports: [TableAccessGuard, TableAccessService, TypeOrmModule],
})
export class TableAccessModule {}
