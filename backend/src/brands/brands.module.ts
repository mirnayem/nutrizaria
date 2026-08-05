import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController, AdminBrandsController } from './brands.controller';

@Module({
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
