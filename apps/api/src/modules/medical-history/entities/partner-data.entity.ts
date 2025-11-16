import { BaseEntity } from '@common/entities/base.entity';
import { BiologicalSex } from '@repo/contracts';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MedicalHistory } from './medical-history.entity';
import { Fenotype } from './fenotype.entity';

@Entity('partner_data')
export class PartnerData extends BaseEntity {
  @ManyToOne(() => MedicalHistory, { nullable: false })
  @JoinColumn({ name: 'medical_history_id', referencedColumnName: 'id' })
  medicalHistory: MedicalHistory;

  @Column({
    type: 'enum',
    enum: BiologicalSex,
    enumName: 'biological_sex_enum',
    name: 'biological_sex',
  })
  biologicalSex: BiologicalSex;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string | null;

  @Column({ name: 'dni', type: 'varchar', length: 20, nullable: true })
  dni?: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date | null;

  @Column({ name: 'occupation', type: 'varchar', length: 100, nullable: true })
  occupation?: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Column({ type: 'text', name: 'genital_backgrounds', nullable: true })
  genitalBackgrounds?: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Fenotype, (fenotype) => fenotype.partnerData)
  fenotypes: Fenotype[];
}
