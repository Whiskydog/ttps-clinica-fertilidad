import { BaseEntity } from '@common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('medical_insurances')
export class MedicalInsurance extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ nullable: true })
  acronym: string;

  @Index()
  @Column({ nullable: true, unique: true })
  externalId: number;
}
