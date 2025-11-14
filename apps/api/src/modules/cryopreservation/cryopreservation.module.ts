import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryopreservedProduct } from './entities/cryopreserved-product.entity';
import { CryopreservationService } from './cryopreservation.service';
import { CryopreservationController } from './cryopreservation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CryopreservedProduct])],
  providers: [CryopreservationService],
  controllers: [CryopreservationController],
  exports: [CryopreservationService],
})
export class CryopreservationModule {}
