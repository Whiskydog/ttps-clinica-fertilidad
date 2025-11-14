import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';

export type ProductType = 'ovule' | 'embryo';

interface JourneyStep {
  date: string;
  time: string;
  phase: string;
  status: string;
}

@Entity('cryopreserved_products')
export class CryopreservedProduct extends BaseEntity {
  @Column({ name: 'product_id', type: 'varchar', length: 100, unique: true })
  productId: string;

  @Column({ name: 'product_type', type: 'varchar', length: 20 })
  productType: ProductType;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'cryopreservation_date', type: 'date' })
  cryopreservationDate: Date;

  @Column({ name: 'location_tank', type: 'varchar', length: 50, nullable: true })
  locationTank: string;

  @Column({ name: 'location_rack', type: 'varchar', length: 50, nullable: true })
  locationRack: string;

  @Column({ name: 'location_tube', type: 'varchar', length: 50, nullable: true })
  locationTube: string;

  @Column({
    name: 'location_position',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  locationPosition: string;

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'treatment_id' })
  treatmentId: number;

  @ManyToOne(() => Treatment)
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  // Campos específicos de embriones
  @Column({ type: 'varchar', length: 10, nullable: true })
  quality: string;

  @Column({ name: 'fertilization_date', type: 'date', nullable: true })
  fertilizationDate: Date;

  @Column({ name: 'pgt_result', type: 'varchar', length: 50, nullable: true })
  pgtResult: string;

  @Column({ type: 'jsonb', nullable: true })
  journey: JourneyStep[];

  // Campos específicos de óvulos
  @Column({ name: 'maturation_state', type: 'varchar', length: 50, nullable: true })
  maturationState: string;

  @Column({ name: 'extraction_date', type: 'date', nullable: true })
  extractionDate: Date;
}
