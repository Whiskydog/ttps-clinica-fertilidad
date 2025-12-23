import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Treatment } from './treatment.entity';

@Entity('medication_protocols')
export class MedicationProtocol extends BaseEntity {
  @Column({ name: 'treatment_id', unique: true })
  treatmentId: number;

  @OneToOne(() => Treatment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @Column({ name: 'protocol_type', type: 'varchar', length: 100 })
  protocolType: string;

  @Column({ name: 'drug_name', type: 'varchar', length: 255 })
  drugName: string;

  @Column({ type: 'varchar', length: 100 })
  dose: string;

  @Column({ name: 'administration_route', type: 'varchar', length: 50 })
  administrationRoute: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'additional_medication', type: 'jsonb', nullable: true })
  additionalMedication: string[];

  @Column({ name: 'consent_signed', type: 'boolean', default: false })
  consentSigned: boolean;

  @Column({ name: 'consent_date', type: 'date', nullable: true })
  consentDate: Date;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'pdf_generated_at', type: 'timestamp', nullable: true })
  pdfGeneratedAt: Date;
}
